import { RedisClient } from "redis"
import { promisify } from "util"
import { println, getRedisCryptKey } from "../util"

export function createClients() {

    const redisReader = new RedisClient({})
    const redisListener = new RedisClient({})
    const listen = promisify(redisListener.on).bind(redisListener)
    const getKey = promisify(redisReader.get).bind(redisReader)

    redisListener.subscribe("updated")

    async function getPrices(pairs: {f: string, t: string}[]) {
        const result: any[] = []
        for (const pair of pairs) {
            const value = await getKey(getRedisCryptKey(pair.f, pair.t))
            if (value != null) result.push(JSON.parse(value))
        }
        return result
    }

    function onUpdated(onMsg: (msg: string) => void) {
        redisListener.on("message", async (channel, msg) => {
            if (channel != "updated") return
            const v = await getKey(msg)
            if (v == null) return
            onMsg(v)
        })
    }

    return {
        getPrices,
        onUpdated,
        close() {
            println("Closing redis clients")
            redisListener.quit()
            redisReader.quit()
        }
    }
}
