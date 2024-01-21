import { v4 as uuidv4 } from "uuid";
import redisClient from "pages/api/middleware/redisClient";

export default async function handler(req, res) {
  const gameId = req.query.gameid;

  const gameData = await redisClient.get(gameId);
  const game = JSON.parse(gameData);

  // Create session
  const session = {};
  const playerId = session.playerId || uuidv4();
  session.playerId = playerId;
  session.alive = true;
  session.banished = false;

  // save session
  game.players.push(session);

  const gameString = JSON.stringify(game);
  await redisClient.set(gameId, gameString);

  res.json({ playerId });
}
