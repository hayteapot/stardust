import { v4 as uuidv4 } from "uuid";
import RedisClient from "pages/api/middleware/redisClient";

export default async function handler(req, res) {
  const gameId = req.query.gameid;

  const redisClient = new RedisClient();
  const game = await redisClient.getGame(gameId);

  // Create session
  const session = {};
  const playerId = session.playerId || uuidv4();
  session.playerId = playerId;
  session.alive = true;
  session.banished = false;

  // save session
  game.players.push(session);

  await redisClient.updateGame(gameId, game);

  res.json({ playerId });
}
