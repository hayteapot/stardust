import RedisClient from "pages/api/middleware/redisClient";

export default async function handler(req, res) {
  const gameId = req.query.gameid;
  const sessionId = req.query.playerid;
  const banishedPlayerId = req.query.banishedPlayerId;

  const redisClient = new RedisClient();
  const game = await redisClient.getGameWithLock(gameId, sessionId);

  // Get details of player to be banished
  const banishedPlayer = game.players.find(
    (player) => player.playerId === banishedPlayerId
  );

  // Update current player state
  const currentPlayer = game.players.find(
    (player) => player.playerId === sessionId
  );

  currentPlayer.voted = true;
  currentPlayer.votedFor = banishedPlayer;

  // Check if every other alive and unbanished player has voted
  const allPlayersVoted = game.players
    .filter((player) => player.alive && !player.banished)
    .every((player) => player.voted);

  if (allPlayersVoted) {
    game.banishState = "revealing";
  }

  // Update player in the game state
  game.players = game.players.map((player) =>
    player.playerId === currentPlayer.playerId ? currentPlayer : player
  );

  await redisClient.updateGame(gameId, game);

  res.json({ gameId });
}
