// redisClient.js
import Redis from "ioredis";

const redisConfig = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

const redisClient = new Redis(redisConfig);

export default redisClient;
