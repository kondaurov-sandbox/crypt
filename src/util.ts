import * as FS from "fs"
import { compileSchema } from "./json-schema"

export function println(s: string) {
    console.log(s)
}

const signals: NodeJS.Signals[] = [ "SIGTERM", "SIGINT" ]

export function onExit(
    block: () => void
) {
    signals.forEach(signal => 
        process.on(signal, () => {
            block()
        })
    )
}

export function tryBlock<A>(
    block: () => A
): A | null {
    try {
        return block()
    } catch (e) {
        console.error("Block error", e)
        return null
    }
}

export function successResponse(resp: any) {
    return {
        success: resp
    }
}

export function errorResponse(error: any) {
    return {
        error
    }
}

export function getRedisCryptKey(from: string, to: string): string {
    return `cryptocompare/${from}/${to}`
}

export function readConfig(): IAppConfig {

    const schema = compileSchema({
        type: "object",
        properties: {
          apiKey: { type: "string" },
          fsyms: { type: "array", items: { type: "string" } },
          tsyms: { type: "array", items: { type: "string" } }
        },
        required: [ "fsyms", "tsyms", "apiKey" ],
        additionalProperties: false
    })

    const file = FS.readFileSync("settings.json")
    const config = JSON.parse(file.toString())

    const res = schema.validate(config)
    if (res == null) return config
    throw res
}


