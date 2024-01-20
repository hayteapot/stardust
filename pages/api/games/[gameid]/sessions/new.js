import { getIronSession } from "iron-session";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  const gameId = req.query.gameid;

  const session = await getIronSession(req, res, {
    password: process.env.SESSION_SECRET,
    cookieName: "my-app-session",
  });

  // if existing session with same game, return playerId
  if (session.playerId && session.gameId === gameId) {
    return res.json({ playerId: session.playerId });
  }

  // if existing session with playerId, but that session does not contain this gameId, wipe the session
  if (session.playerId && !session.gameId) {
    session.destroy();
  }

  // Create session
  const playerId = session.playerId || uuidv4();

  session.playerId = playerId;
  session.gameId = gameId;

  // save session
  await session.save();

  res.json({ playerId });
}
