import { getIronSession } from "iron-session";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

const redisConfig = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

const redis = new Redis(redisConfig);

export default async function handler(req, res) {
  try {
    // Generate unique game ID and player ID
    const gameId = uuidv4();

    // Store game ID in Redis with initial data
    await redis.set(gameId, "{}");

    res.status(201).json({ gameId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create game" });
  }
}
