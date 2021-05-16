import { getMarkets } from "./service/service"

const o1 = {
    "price": "1"
}

const o2 = {
    "price": "2",
    "prop2": "ttt"
}

async function main() {
    console.log({
        ...o1, ...o2
    })

    await getMarkets({
        apiKey: "c99b160f840f7559492b91c68dfc528f6c5b6e73b2a94f9993ebefd6b0133443",
        from: "BTC",
        to: [ "RUR", "USD" ]
    })
}

main()
