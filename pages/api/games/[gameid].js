import RedisClient from "../middleware/redisClient";

const getTreacherousPlayers = (players) => {
  console.log("identifying treacherous players");

  const numPlayers = players.length;

  console.log("NUM PLAYERS", numPlayers);

  // Ensure at least one traitor for games with less than 5 players
  const numTreacherousPlayers =
    numPlayers < 5
      ? 1
      : numPlayers < 11
      ? Math.floor(numPlayers / 3)
      : Math.floor(numPlayers / 4);

  console.log("NUM DESIRED TREACHEROUS PLAYERS", numTreacherousPlayers);

  const treacherousPlayers = players
    .sort(() => Math.random() - 0.5)
    .slice(0, numTreacherousPlayers)
    .map((player) => player.playerId);

  return treacherousPlayers;
};

const moveNextRound = (currentRound) => currentRound + 1;

const isBreakfastRound = (round) => round.roundType === "breakfast";

const getRandomElement = (array) =>
  array[Math.floor(Math.random() * array.length)];

const getRandomPlayerToGoToBreakfast = (players) => {
  const playersNotAtBreakfast = players.filter(
    (player) => !player.readyForBreakfast
  );
  return getRandomElement(playersNotAtBreakfast);
};

const handlePlayerAtBreakfast = async (redisClient, gameId, game) => {
  const playersEligibleForBreakfast = game.players.filter(
    (player) => player.alive && !player.banished
  );
  const playersAtBreakfast = playersEligibleForBreakfast.filter(
    (player) => player.readyForBreakfast
  );

  // If not all players have made it to breakfast
  if (playersAtBreakfast.length !== playersEligibleForBreakfast.length) {
    // Sometimes, just don't release a player for fun. 75% chance we skip and wait for next ping to release
    if (Math.random() < 0.75) {
      console.log("SKIPPING RELEASE OF PLAYER TO BREAKFAST");
      return;
    }

    game = await redisClient.getGameWithLock(gameId);

    const playerToGoToBreakfast = getRandomPlayerToGoToBreakfast(
      playersEligibleForBreakfast
    );

    console.log("PLAYER TO GO TO BREAKFAST", playerToGoToBreakfast);

    playerToGoToBreakfast.readyForBreakfast = true;

    if (game.lastNightsMurderedPlayerId === playerToGoToBreakfast.playerId) {
      playerToGoToBreakfast.alive = false;
    }

    game.players = game.players.map((player) =>
      player.playerId === playerToGoToBreakfast.playerId
        ? playerToGoToBreakfast
        : player
    );

    await redisClient.updateGame(gameId, game);
  }

  // If all players have made it to breakfast
  // TODO assign next round (mission, round table, and if enough players nighttime)
};

export default async function handler(req, res) {
  const gameId = req.query.gameid;

  try {
    const redisClient = new RedisClient();
    let game = await redisClient.getGame(gameId);

    const allPlayersReady = game.players.every(
      (player) => player.roundCompleted
    );

    console.log("ALL PLAYERS READY", allPlayersReady);

    const isBreakfast = isBreakfastRound(
      game.gameRounds[game.currentRound - 1]
    );

    console.log("IS BREAKFAST", isBreakfast);

    if (isBreakfast) {
      await handlePlayerAtBreakfast(redisClient, gameId, game);
    }

    if (allPlayersReady) {
      game = await redisClient.getGameWithLock(gameId);

      if (game.currentRound === 4) {
        const treacherousPlayers = getTreacherousPlayers(game.players);

        // Replace players with treacherous players
        game.players = game.players.map((player) => {
          if (treacherousPlayers.includes(player.playerId)) {
            player.treacherous = true;
          }
          return player;
        });
      }

      // Reset players to round completed false
      game.players = game.players.map((player) => {
        player.roundCompleted = false;
        return player;
      });

      game.currentRound = moveNextRound(game.currentRound);
      await redisClient.updateGame(gameId, game);
    }

    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch game data" });
  }
}
