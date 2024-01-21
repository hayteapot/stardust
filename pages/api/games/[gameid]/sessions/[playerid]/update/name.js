import RedisClient from "pages/api/middleware/redisClient";

export default async function handler(req, res) {
  const gameId = req.query.gameid;
  const sessionId = req.query.playerid;
  const playerName = req.query.playerName;

  // find this player id
  const redisClient = new RedisClient();
  const session = await redisClient.getGameSession(gameId, sessionId);

  console.log(session);

  session.playerName = playerName;

  await redisClient.updateGameSession(gameId, sessionId, session);

  res.json(session);
}
