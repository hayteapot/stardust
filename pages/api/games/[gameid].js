import RedisClient from "../middleware/redisClient";

const getTreacherousPlayers = (players) => {
  const numPlayers = players.length;
  const numTreacherousPlayers = Math.max(1, Math.floor(numPlayers / 3));
  const treacherousPlayers = players
    .sort(() => Math.random() - 0.5)
    .slice(0, numTreacherousPlayers)
    .map((player) => player.playerId);

  return treacherousPlayers;
};

const updatePlayersStatus = (players, isTreacherous) => {
  return players.map((player) => ({
    ...player,
    isTreacherous: isTreacherous.includes(player.playerId),
    roundCompleted: false,
  }));
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
    game = await redisClient.getGameWithLock(gameId);

    const playerToGoToBreakfast = getRandomPlayerToGoToBreakfast(
      playersEligibleForBreakfast
    );

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
    const isBreakfast = isBreakfastRound(game.rounds[game.currentRound - 1]);

    if (isBreakfast) {
      await handlePlayerAtBreakfast(redisClient, gameId, game);
    }

    if (allPlayersReady) {
      game = await redisClient.getGameWithLock(gameId);

      if (game.currentRound === 4) {
        const treacherousPlayers = getTreacherousPlayers(game.players);
        game.players = updatePlayersStatus(game.players, treacherousPlayers);
      }

      game.players = updatePlayersStatus(game.players, []);
      game.currentRound = moveNextRound(game.currentRound);
      await redisClient.updateGame(gameId, game);
    }

    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch game data" });
  }
}
