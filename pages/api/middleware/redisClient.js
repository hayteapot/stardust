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
    console.log("savingGame:", game);

    try {
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

  async getGameSession(gameId, sessionId) {
    let game = await this.getGame(gameId);

    const session = game.players.find(
      (player) => player.playerId === sessionId
    );

    return session;
  }

  async updateGameSession(gameId, sessionId, updatedSession) {
    let game = await this.getGame(gameId);
    game = await this.getGame(gameId);

    let session = game.players.find((player) => player.playerId === sessionId);

    console.log("originalSession", session);
    console.log("updatedSession", updatedSession);

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
