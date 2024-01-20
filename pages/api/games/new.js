import { v4 as uuidv4 } from "uuid";
import redisClient from "../middleware/redisClient";

export default async function handler(req, res) {
  try {
    // Generate unique game ID and player ID
    const gameId = uuidv4();

    // Store game ID in Redis with initial data
    await redisClient.set(gameId, "{}");

    res.status(201).json({ gameId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create game" });
  }
}
