import RedisClient from "pages/api/middleware/redisClient";

const getRandomElement = (array) =>
  array[Math.floor(Math.random() * array.length)];

const isBreakfastRound = (round) => round.roundType === "breakfast";

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

export default async function handler(req, res) {
  const gameId = req.query.gameid;
  const sessionId = req.query.playerid;
  const roundCompleted = req.query.roundCompleted;

  // find this player id
  const redisClient = new RedisClient();
  const game = await redisClient.getGameWithLock(gameId, sessionId);
  const session = game.players.find((player) => player.playerId === sessionId);
  session.roundCompleted = roundCompleted;

  // Find out if all other players have finished, and if so, increment round
  const allPlayersReady = game.players.every((player) => player.roundCompleted);

  console.log(
    `Completing round for ${sessionId} in game ${gameId}, all players ready: ${allPlayersReady}`
  );

  if (allPlayersReady) {
    const isBreakfast = isBreakfastRound(
      game.gameRounds[game.currentRound - 1]
    );

    const playersInGame = game.players.filter(
      (player) => player.alive && !player.banished
    );

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

    if (isBreakfast) {
      // If we're completing breakfast, pick daily activity
      // Find out how many activity rounds we have already had in game.gameRounds
      const activityRounds = game.gameRounds.filter(
        (round) =>
          round.roundType === "physical-activity" ||
          round.roundType === "mental-activity"
      );

      // If none, then add a physical activity, otherwise, add a mental activity
      const activityRoundType =
        activityRounds.length === 0 ? "physical-activity" : "mental-activity";

      if (activityRoundType === "physical-activity") {
        // Select an activity that has not been done yet from gameData.physicalActivities
        const activity = getRandomElement(
          game.physicalActivities.filter((a) => !a.done)
        );

        // Select a player to lead the round
        const leadPlayer = getRandomElement(playersInGame);
        game.currentActivity = activity.groupGoal;
        game.currentActivityLeadPlayer = leadPlayer;

        activity.groupGoal = activity.groupGoal.replace(
          /PLAYERCOUNT/g,
          playersInGame.length
        );

        activity.shieldGoal = activity.shieldGoal.replace(
          /PLAYERCOUNTMINUS1/g,
          playersInGame.length - 1
        );

        // Schedule the game round
        game.gameRounds.push({
          activityId: activity.activityId,
          leadPlayerId: leadPlayer.playerId,
          leadPlayerName: leadPlayer.playerName,
          shieldGoal: activity.shieldGoal,
          groupGoal: activity.groupGoal,
          players: playersInGame,
          activityCompleted: false,
          prizePot: playersInGame.length * 1000,
          canSpeak: true,
          roundType: activityRoundType,
          roundName: `Challenge ${activityRounds.length + 1}`,
        });
      }
    }

    // Reset players to round completed false
    game.players = game.players.map((player) => {
      player.roundCompleted = false;
      return player;
    });

    game.currentRound = moveNextRound(game.currentRound);
    game.currentRoundStartTime = new Date().getTime();
  }

  await redisClient.updateGame(gameId, game);

  res.json(session);
}
