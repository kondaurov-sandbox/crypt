import express from "express"
import { println, successResponse, errorResponse, onExit } from "../util"
import { compileSchema } from "../json-schema"
import { createClients } from "./redis"

const app = express()

const port = 8080

const redis = createClients()

app.get("/", (req, res) => {
    res.json("index pager")
})

function checkAgainsJsonSchema(schema: any): express.RequestHandler {
    const compiled = compileSchema(schema)
    return (req, res, next) => {
        const errors = compiled.validate(req.query)
        if (errors == null) return next()
        res.json(errorResponse(errors))
    }
}

app.get("/price", checkAgainsJsonSchema({
    type: "object",
    properties: {
      fsyms: { type: "string" },
      tsyms: { type: "string" }
    },
    required: ["fsyms", "tsyms"],
    additionalProperties: true
}), async (req, res) => {

    const fromSyms = (req.query["fsyms"] as String).split(",")
    const toSyms = (req.query["tsyms"] as String).split(",")

    const combinations = fromSyms.flatMap(f => 
        toSyms.map(t => { return {f, t} })
    )

    const result = await redis.getPrices(combinations)

    res.json(successResponse(result))
})

app.get('/updates', function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })
    redis.onUpdated(msg => {
        res.write("data: " + msg + "\n\n")
    })
    res.on("close", () => {
        println("request closed")
    })
  })

const server = app.listen(port, () => {
    println(`http server started on port ${port}`)
})

onExit(() => {
    server.close()
    redis.close()
})
