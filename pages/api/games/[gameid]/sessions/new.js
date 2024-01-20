import { getIronSession } from "iron-session";
import { v4 as uuidv4 } from "uuid";
import Redis from "ioredis";

const redisConfig = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

const redis = new Redis(redisConfig);

export default async function handler(req, res) {
  const gameId = req.query.gameid;

  const session = await getIronSession(req, res, {
    password: process.env.SESSION_SECRET,
    cookieName: "my-app-session",
  });

  // if existing session with playerId, but that session does not contain this gameId, wipe the session
  if (session.playerId && !session.gameId) {
    session.destroy();
  }

  const playerId = session.playerId || uuidv4();

  session.playerId = playerId;
  session.gameId = gameId;

  // update the game in redis to contain this player id
  const gameData = await redis.get(gameId);
  const game = JSON.parse(gameData);
  game.players = game.players || [];
  game.players.push(playerId);
  const gameString = JSON.stringify(game);
  await redis.set(gameId, gameString);

  // save session
  await session.save();

  res.json({ playerId });
}
