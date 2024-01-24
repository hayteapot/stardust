import RedisClient from "../../../../middleware/redisClient";

const isBreakfastRound = (round) => round.roundType === "breakfast";

const getRandomElement = (array) =>
  array[Math.floor(Math.random() * array.length)];

const getRandomPlayerToGoToBreakfast = (players) => {
  const playersNotAtBreakfast = players.filter(
    (player) => !player.readyForBreakfast
  );
  return getRandomElement(playersNotAtBreakfast);
};

const handlePlayerAtBreakfast = async (
  redisClient,
  gameId,
  game,
  sessionId
) => {
  const playersNotAtBreakfast = game.players.filter(
    (player) => player.alive && !player.banished && !player.readyForBreakfast
  );

  const playersAtBreakfast = playersNotAtBreakfast.filter(
    (player) => player.readyForBreakfast
  );

  // find out it a player was murdered last night, and if so they must be part of final group at breakfast
  const murderedPlayerId = game.lastNightsMurderedPlayerId;
  if (murderedPlayerId) {
    // Sort players eligible for breakfast by player id and put the murdered player at the end of the list
    playersNotAtBreakfast.sort((a, b) => a.playerId - b.playerId);
    const murderedPlayer = playersNotAtBreakfast.find(
      (player) => player.playerId === murderedPlayerId
    );
    playersNotAtBreakfast.splice(
      playersNotAtBreakfast.indexOf(murderedPlayer),
      1
    );
    playersNotAtBreakfast.push(murderedPlayer);
  }

  // If not all players have made it to breakfast
  if (playersAtBreakfast.length !== playersNotAtBreakfast.length) {
    const somePlayersAtBreakfast = playersAtBreakfast.length > 1;
    const enoughTimeHasPassedSinceLastPlayerRelease =
      new Date().getTime() > game.currentRoundStartTime + 90000;

    console.log(
      `Deciding whether to release new players for breakfast - somePlayersAtBreakfast: ${somePlayersAtBreakfast}, enoughTimeHasPassedSinceLastPlayerRelease: ${enoughTimeHasPassedSinceLastPlayerRelease}`
    );

    if (somePlayersAtBreakfast && !enoughTimeHasPassedSinceLastPlayerRelease) {
      return;
    }

    game = await redisClient.getGameWithLock(gameId, sessionId);

    // If players left to go to breakfast is even, release 2. If odd, 3.
    const numPlayersToRelease = playersNotAtBreakfast.length % 2 === 0 ? 2 : 3;

    console.log(`Releasing ${numPlayersToRelease} players for breakfast`);

    // Release next n players for breakfast
    const playersGoingToBreakfast = [];
    for (let i = 0; i < numPlayersToRelease; i++) {
      const playerToGoToBreakfast = playersNotAtBreakfast[i];
      playerToGoToBreakfast.readyForBreakfast = true;
      if (playerToGoToBreakfast.playerId === murderedPlayerId) {
        playerToGoToBreakfast.alive = false;
      }

      playersGoingToBreakfast.push(playerToGoToBreakfast);

      game.players = game.players.map((player) =>
        player.playerId === playerToGoToBreakfast.playerId
          ? playerToGoToBreakfast
          : player
      );
    }

    console.log("PLAYERS TO GO TO BREAKFAST", playersGoingToBreakfast);

    // Reset current round start time to ensure at least 60 seconds between players
    game.currentRoundStartTime = new Date().getTime();

    await redisClient.updateGame(gameId, game, sessionId);
  }
};

export default async function handler(req, res) {
  const gameId = req.query.gameid;
  const sessionId = req.query.playerid;

  try {
    const redisClient = new RedisClient();
    let game = await redisClient.getGame(gameId);

    const isBreakfast = isBreakfastRound(
      game.gameRounds[game.currentRound - 1]
    );

    if (isBreakfast) {
      await handlePlayerAtBreakfast(redisClient, gameId, game, sessionId);
    }

    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch game data" });
  }
}
