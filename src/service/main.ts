
import { createService } from "./service"
import { println, onExit, readConfig } from "../util"

println("Starting service")

let service: IService = createService(readConfig())

onExit(() => {
    if (service != null) service.close()
})

process.on('uncaughtException', function (err) {
    console.log(`uncaugh err: ${err}`)
})
