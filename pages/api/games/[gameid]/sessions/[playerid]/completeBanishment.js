import RedisClient from "pages/api/middleware/redisClient";

export default async function handler(req, res) {
  const gameId = req.query.gameid;
  const sessionId = req.query.playerid;

  const redisClient = new RedisClient();
  const game = await redisClient.getGameWithLock(gameId, sessionId);

  // Update current player state
  const currentPlayer = game.players.find(
    (player) => player.playerId === sessionId
  );

  currentPlayer.readyToBanish = true;

  // Check if every other alive and unbanished player has voted
  const allPlayersReady = game.players
    .filter((player) => player.alive && !player.banished)
    .every((player) => player.readyToBanish);

  if (allPlayersReady) {
    // Find player with the most votes
    const voteCounts = {};
    game.players
      .filter((player) => player.alive && !player.banished)
      .forEach((player) => {
        if (!voteCounts[player.votedFor.playerId]) {
          voteCounts[player.votedFor.playerId] = 0;
        }

        voteCounts[player.votedFor.playerId]++;
      });

    // find if we have a tie
    const maxVotes = Math.max(...Object.values(voteCounts));
    const tiedPlayerIds = Object.keys(voteCounts).filter(
      (playerId) => voteCounts[playerId] === maxVotes
    );
    const tieExists = tiedPlayerIds.length > 1;

    if (tieExists) {
      // Setup a vote between tied players
      game.banishState = "revoting";
      game.playersToBanish = tiedPlayerIds.map((playerId) =>
        game.players.find((player) => player.playerId === playerId)
      );

      // Reset all players voting states
      game.players = game.players.map((player) => ({
        ...player,
        voted: false,
        votedFor: null,
        readyToBanish: false,
      }));
    } else {
      game.banishState = "banishing";
      const mostVotedPlayerId = Object.keys(voteCounts).find(
        (playerId) => voteCounts[playerId] === maxVotes
      );
      game.playerToBanish = game.players.find(
        (player) => player.playerId === mostVotedPlayerId
      );
    }
  }

  // Update player in the game state
  game.players = game.players.map((player) =>
    player.playerId === currentPlayer.playerId ? currentPlayer : player
  );

  await redisClient.updateGame(gameId, game);

  res.json({ gameId });
}
