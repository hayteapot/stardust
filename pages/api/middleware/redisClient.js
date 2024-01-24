import Redis from "ioredis";

class RedisClient {
  constructor() {
    this.redisConfig = {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    };
  }

  async getGameWithLock(gameId, sessionId) {
    while (true) {
      try {
        const game = await this.getGame(gameId);
        if (!game.lock) {
          console.log(`Locking game ${gameId} for session: ${sessionId}`);
          await this.updateGame(gameId, { ...game, lock: sessionId });
          game.lock = sessionId;
          return game; // Lock acquired successfully
        } else if (game.lock === sessionId) {
          console.log(`Game already locked by this session: {sessionId}`);
          return game; // Already locked by this session
        }
      } catch (error) {
        // Handle errors appropriately
      }

      console.log(
        `Session ${sessionId} waiting for lock ${game.lock} to release`
      );
      await new Promise((r) => setTimeout(r, 1000)); // Retry with delay
    }
  }

  async getGame(gameId) {
    let game = {};
    const redisClient = new Redis(this.redisConfig);

    try {
      const gameData = await redisClient.get(gameId);
      game = JSON.parse(gameData);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch game data");
    } finally {
      await redisClient.quit();
    }

    return game;
  }

  async updateGame(gameId, game) {
    const redisClient = new Redis(this.redisConfig);

    console.log(`Releasing lock ${game.lock} and updating game ${gameId}`);

    try {
      game.lock = null;
      const gameString = JSON.stringify(game);
      await redisClient.set(gameId, gameString);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update game data");
    } finally {
      await redisClient.quit();
    }

    return game;
  }

  async getGameSessionWithLock(gameId, sessionId) {
    let game = await this.getGameWithLock(gameId, sessionId);

    const session = game.players.find(
      (player) => player.playerId === sessionId
    );

    return session;
  }

  async updateGameSession(gameId, sessionId, updatedSession) {
    let game = await this.getGameWithLock(gameId, sessionId);

    // replace session with the updated session
    game.players = game.players.map((player) => {
      if (player.playerId === sessionId) {
        player = updatedSession;
      }
      return player;
    });

    await this.updateGame(gameId, game);

    return updatedSession;
  }
}

export default RedisClient;
