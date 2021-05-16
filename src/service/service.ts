import Websocket from "ws"
import * as Redis from "./redis"
import { println, getRedisCryptKey } from "../util"

import fetch from "node-fetch"

export async function getMarkets(req: GetMarkets): Promise<{ [key: string]: string } | null> {
    const url = `https://min-api.cryptocompare.com/data/v2/subs?fsym=${req.from}&tsyms=${req.to.join(",")}`
    return fetch(url, {
        method: "GET",
        headers: {
            "authorization": `Apikey ${req.apiKey}`
        }
    }).then(resp => resp.json()).then(resp => {
        if (resp.Response == "Error") {
            throw resp.Message
        }
        let result: {[key: string]: string} = {}
        Object
            .entries<any>(resp.Data?.Pairs)
            .forEach(k => result[k[0]] = k[1]["HIGHEST_RATED_MARKET"])
        return result
    }).catch(e => {
        console.error("Get markets", e)
        return null
    })

}

function connect(
    config: IAppConfig,
    onMsg: (msg: any) => void
): Websocket {

    const socket = new Websocket(
        "wss://streamer.cryptocompare.com/v2", 
        {
            headers: {
                "authorization": `Apikey ${config.authKey}`
            }
        }
    )

    socket.on("message", msg => {
        const resp = JSON.parse(msg.toString())
        onMsg(resp)
    })

    socket.on("open", () => {
        config.fromSyms.forEach(async from => {
            const markets = await getMarkets({
                apiKey: config.authKey,
                from,
                to: config.toSyms
            })
            if (markets == null) return
            const marketsArr = Object.values(markets)
            println(`Subscribing for marketss: ${marketsArr.join(" ")}`)

            const req = JSON.stringify({
                action: "SubAdd",
                subs: marketsArr
            })
            socket.send(req)
        })
    })

    return socket
}

export function createService(
    config: IAppConfig
): IService {

    const redis = Redis.createClients()

    let socket = connect(config, onMsg)

    let lastHeartbeat: number

    function checkIsAlive(): boolean {
        if (lastHeartbeat == null) return false
        return (new Date().getTime() - lastHeartbeat) < 30000
    }

    function onMsg(msg: any) {
        println(`got new message ${msg["TYPE"]}`)
        switch (msg["TYPE"]) {
            case "999": lastHeartbeat = msg["TIMEMS"]; break
            case "2":
                const key = getRedisCryptKey(msg["FROMSYMBOL"], msg["TOSYMBOL"])
                redis.savePrice(key, msg)
            default:
                println(msg)
        }
    }

    println("Service createddd")

    const timer = setInterval(() => {
        const isAlive = checkIsAlive()
        if (!isAlive) {
            println("websocket status " + isAlive)
            println("need to reconnect to ws")
            socket.close()
            socket = connect(config, onMsg) 
        }
    }, 30000)

    return {
        close() {
            println("Closing service")
            redis.close()
            clearInterval(timer)
            if (socket != null) {
                println("Closing websocket")
                socket.close()
            }
        }
    }
}
