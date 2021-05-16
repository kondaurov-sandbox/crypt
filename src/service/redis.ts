import { RedisClient } from "redis"
import { promisify } from "util"
import { println } from "../util"

export function createClients() {
    const redisWriter = new RedisClient({})
    const redisPublisher = new RedisClient({})
    const pub = promisify(redisPublisher.publish).bind(redisPublisher)
    const getKey = promisify(redisWriter.get).bind(redisWriter)

    async function savePrice(key: string, o: any): Promise<Boolean> {
        let curr = await getKey(key)
        if (curr == null) curr = "{}"
        const res = { ...JSON.parse(curr), ...o }
        // console.log("save redis key", res)
        const isSet = redisWriter.set(key, JSON.stringify(res))
        if (isSet) await pub("updated", key)
        return isSet
    }

    return {
        savePrice,
        close() {
            println("Closing redis")
            redisPublisher.quit()
            redisWriter.quit()
        }
    }
    
}
