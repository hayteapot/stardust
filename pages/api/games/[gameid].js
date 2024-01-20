import redisClient from "../middleware/redisClient";

export default async function handler(req, res) {
  const gameId = req.query.gameid;

  try {
    const gameData = await redisClient.get(gameId);
    const game = JSON.parse(gameData);
    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch game data" });
  }
}
