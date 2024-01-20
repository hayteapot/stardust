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
  const playerName = req.query.playerName;
  const ready = req.query.ready;
  const treacherous = req.query.treacherous;
  const gameId = req.query.gameid;

  const session = await getIronSession(req, res, {
    password: process.env.SESSION_SECRET,
    cookieName: "my-app-session",
  });

  session.playerName = playerName;
  session.ready = ready;
  session.treacherous = treacherous;

  // update the game in redis to contain this player id
  const gameData = await redis.get(gameId);
  const game = JSON.parse(gameData);
  game.players = game.players || [];
  game.players.push({
    playerId: session.playerId,
    playerName,
    ready,
    treacherous,
  });

  const gameString = JSON.stringify(game);
  await redis.set(gameId, gameString);

  // save session
  await session.save();

  res.json({ playerId: session.playerId });
}
