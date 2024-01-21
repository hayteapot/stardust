import RedisClient from "pages/api/middleware/redisClient";

export default async function handler(req, res) {
  const gameId = req.query.gameid;
  const sessionId = req.query.playerid;
  const roundCompleted = req.query.roundCompleted;

  // find this player id
  const redisClient = new RedisClient();
  const session = await redisClient.getGameSession(gameId, sessionId);

  session.roundCompleted = roundCompleted;

  await redisClient.updateGameSession(gameId, sessionId, session);

  res.json(session);
}
