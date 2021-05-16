# Project structure

Project (backend) contains two microservices:
1) First (service) works with cryptocompare itself and gathers fresh statistic data and stores it in redis. It uses pubsub redis feature in order to notify second server that statistic was updated.

2) Second (server) is simple http server (express) that takes statistic from redis. It also listens redis channel for updates and sends back updated statistic to users via server sent events (sse) feature.

# Why do we use redis?
Redis is much simpler then any relational database (mysql/postgres) and has very convenient api and it also has pub/sub feature.
It fits better for our case because we need it for cache purpose mainly.

# Code locations

Logic related to cryptocompare is located under `src/service`

Server (express) application lives in `src/server`

root files are used in both services

# Running application

Create `settings.json` file with following structure:
```
{
    "apiKey": "your api key",
    "fromSyms": ["BTC"],
    "toSyms": ["USD", "RUR"]
}
```

To run two services just use pm2 (process manager)
It also will restart any service in case it was stopped for anyreason.

# What to improve

1. I could easily deploy this service on my own server with nice domain name.
2. I could write simple VueJS applications that would display cryptocompare statistic in nice way.

