import Redis from "ioredis";

const redisConfig = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

const redis = new Redis(redisConfig);

export default async function handler(req, res) {
  const gameId = req.query.gameid;

  try {
    const gameData = await redis.get(gameId); // Retrieve game data from Redis

    res.status(200).json({ gameData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch game data" });
  }
}
