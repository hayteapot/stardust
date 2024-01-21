import RedisClient from "../middleware/redisClient";

export default async function handler(req, res) {
  const gameId = req.query.gameid;

  try {
    const redisClient = new RedisClient();
    const game = await redisClient.getGame(gameId);

    // if all players have status round completed, move to next round and set all players to round not completed
    const allPlayersReady = game.players.every(
      (player) => player.roundCompleted
    );

    if (allPlayersReady) {
      // set all players to round not completed
      game.players = game.players.map((player) => {
        return {
          ...player,
          roundCompleted: false,
        };
      });

      // move to next round
      game.currentRound = game.currentRound + 1;
    }

    // save game
    await redisClient.updateGame(gameId, game);

    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch game data" });
  }
}
