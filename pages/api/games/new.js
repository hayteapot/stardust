import { v4 as uuidv4 } from "uuid";
import redisClient from "../middleware/redisClient";

export default async function handler(req, res) {
  try {
    // Generate unique game ID and player ID
    const gameId = uuidv4();

    // Setup game and basic game state
    const game = {
      gameId,
      players: [],
      gameRounds: [
        {
          roundNumber: 1,
          roundType: "train-station",
          roundStarted: true,
          roundFinished: false,
          roundName: "At the station",
          playerInstructions: [
            "You have arrived at the train station, on your way to explore a remote Scottish Mansion. Set your name, and get ready to meet your fellow players",
            "You're ready to go. Wait for all players to join, then board the train.",
          ],
        },
        {
          roundNumber: 2,
          roundType: "train-journey",
          roundStarted: false,
          roundFinished: false,
          roundName: "On the train",
          canSpeak: true,
          playerInstructions: [
            "You are on the train, and the journey has begun. While you're on the train, let's give you some basic instructions",
            "The game will instruct you when you can speak.",
            "The game will instruct you when you can not speak.",
            "Sometimes, things will happen for different players slightly out of sequence. This is normal, and helps mask the actions of some players.",
            "During this game, you will play many different mini games and quizzes. Some will allow you to speak, others will forbit it. Play close attention to the instructions, and you will be fine.",
            "Enjoy your time with your fellow passengers. When you are all ready, click Arrive.",
          ],
        },
        {
          roundNumber: 3,
          roundType: "arrival",
          roundStarted: false,
          roundFinished: false,
          roundName: "Arrival",
          canSpeak: false,
          playerInstructions: [
            "You have arrived, and a mysterious character named Claud arrives. With a fabuluous fringe, they greet you... and let you know what you are in for.....",
            "If you can survive in this house, a great prize awaits. But, this house will turn you against each other. One or more of you will betray the group. ",
            "When you enter, I will choose one or more of you to become treacherous. You will not know who is treacherous, but you will know if you are treacherous. ",
            "Each day, you will be given a new challenge. If you complete this challenge, you will add money to the prize pot",
            "Each day, you will have the chance to banish one player from the house, through a vote at the round table. This player is out of the game",
            "But, be careful. Each night, the treacherous will get a chance to murder an innocent player. Use your round table votes wisely, and banish the treacherous",
            "The innocent win by surviving until the final day. If any treacherous are still playing after the final round table vote, they automatically win the game. The innocent must eliminate all treacherous to win. ",
          ],
        },
        {
          roundNumber: 4,
          roundType: "first-round-table",
          roundStarted: false,
          roundFinished: false,
          canSpeak: false,
          roundName: "First round table",
          playerInstructions: [
            "You are at the first round table. The fabulous Claud arrives and instructs When you have all pressed ready, you will find out if you are innocent, or treacherous. ",
            "Put your heads down. Do not look at each other. I am about to reveal if you are innocent, or treacherous. ",
            "Now you are ready. It is late in the day, and time to rest. Press next, and we will reconvene tomorrow for the first breakfast. ",
          ],
        },
        {
          roundNumber: 5,
          roundType: "breakfast",
          roundStarted: false,
          roundFinished: false,
          canSpeak: false,
          roundName: "Breakfast",
          playerInstructions: [
            "Players are still arriving. Wait for all players to arrive... or not, and then press ready. ",
          ],
        },
      ],
    };

    // Create player 1 session
    const session = {};
    const playerId = uuidv4();
    session.playerId = playerId;
    session.alive = true;
    session.banished = false;

    // save session
    game.players = [];
    game.players.push(session);

    // Store game ID in Redis with initial data
    const gameString = JSON.stringify(game);
    await redisClient.set(gameId, gameString);

    res.status(201).json({ gameId, playerId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create game" });
  }
}
