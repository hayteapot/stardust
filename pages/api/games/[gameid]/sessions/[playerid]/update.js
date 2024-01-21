import redisClient from "pages/api/middleware/redisClient";

export default async function handler(req, res) {
  const sessionId = req.query.playerid;
  const playerName = req.query.playerName;
  const ready = req.query.ready;
  const treacherous = req.query.treacherous;
  const gameId = req.query.gameid;
  const alive = req.query.alive;
  const banished = req.query.banished;

  console.log("looking for player session");

  // find this player id
  const gameData = await redisClient.get(gameId);
  const game = JSON.parse(gameData);
  const session = game.players.find((player) => player.playerId === sessionId);

  console.log(session);

  session.playerName = playerName;
  session.ready = ready;
  session.treacherous = treacherous;
  session.alive = alive;
  session.banished = banished;

  const gameString = JSON.stringify(game);
  await redisClient.set(gameId, gameString);

  res.json(session);
}
