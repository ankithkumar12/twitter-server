import Redis, { RedisOptions } from "ioredis";

export const redisClient = new Redis(process.env.REDIS_PATH as RedisOptions);
