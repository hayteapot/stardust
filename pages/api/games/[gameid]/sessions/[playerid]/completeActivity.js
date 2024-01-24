import RedisClient from "pages/api/middleware/redisClient";

export default async function handler(req, res) {
  const gameId = req.query.gameid;
  const activityId = req.query.activityId;
  const prizePot = req.query.prizePot;
  const shieldPlayerId = req.query.shieldPlayerId;
  const sessionId = req.query.playerid;

  const redisClient = new RedisClient();
  const game = await redisClient.getGameWithLock(gameId, sessionId);

  // Complete game
  game.currentActivity = null;
  game.currentActivityLeadPlayer = null;
  game.prizePot = game.prizePot ? 0 : prizePot;
  game.prizePot += prizePot;
  game.physicalActivities = game.physicalActivities.map((a) =>
    a.groupGoal === activityId ? { ...a, done: true } : a
  );

  // Give shield to player who won
  // shieldPlayerId can be null but that doesn't actually affect the logic
  game.players = game.players.map((player) => {
    player.roundCompleted = false;
    player.hasShield = player.playerId === shieldPlayerId;
    return player;
  });

  const currentRound = game.currentRound;

  // Depending how many alive / unbanished players there are, we either need to schedule a final round table, or an entire new day
  const aliveAndUnbanishedPlayers = game.players.filter(
    (player) => player.alive && !player.banished
  );

  if (aliveAndUnbanishedPlayers.length > 3) {
    // We need to schedule a round table, night time quiz and next breakfast
    game.gameRounds.push({
      roundNumber: currentRound + 1,
      roundType: "round-table",
      roundName: "Round Table",
    });

    game.gameRounds.push({
      roundNumber: currentRound + 2,
      roundType: "night",
      roundName: "Night Time",
    });

    game.gameRounds.push({
      roundNumber: currentRound + 3,
      roundType: "breakfast",
      canSpeak: false,
      roundName: "Breakfast",
      playerInstructions: [
        "At the breakfast table, you can enjoy a range of snacks (bringing snacks out at this point in the game really helps set the mood). You wait in trepidation to find out what players survived the night. At the end of breakfast, your daily challenge will be set. ",
      ],
    });

    // For the round table, we will need to know which players are eligible to be banished
    const playersEligibleForBanishment = game.players.filter(
      (player) => player.alive && !player.banished
    );

    game.playersToBanish = playersEligibleForBanishment;

    game.banishState = "voting";
  } else {
    // We need to schedule a final round table and game over
    game.gameRounds.push({
      roundNumber: currentRound + 1,
      roundType: "round-table",
      roundName: "Round Table",
    });

    game.gameRounds.push({
      roundNumber: currentRound + 2,
      roundType: "game-over",
      roundName: "Game Over",
    });
  }

  // Increase round
  game.currentRound += 1;

  await redisClient.updateGame(gameId, game);

  res.json({ gameId });
}
