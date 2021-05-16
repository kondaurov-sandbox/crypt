interface IAppConfig {
    authKey: string
    fromSyms: string[]
    toSyms: string[]
}

interface GetMarkets {
    apiKey: string
    from: string
    to: string[]
}

interface SubCoin {
    from: string
    to: string
}

interface IService {
    close(): void
}