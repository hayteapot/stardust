import { v4 as uuidv4 } from "uuid";
import RedisClient from "../middleware/redisClient";

export default async function handler(req, res) {
  try {
    // Generate unique game ID and player ID
    const gameId = uuidv4();

    // Setup game and basic game state
    const game = {
      gameId,
      players: [],
      currentRound: 1,
      gameRounds: [
        {
          roundNumber: 1,
          roundType: "train-station",
          roundName: "At the station",
          canSpeak: true,
          playerInstructions: [
            "You have arrived at the train station, on your way to explore a remote Scottish Mansion. Set your name, and get ready to meet your fellow players",
            "You're ready to go. Wait for all players to join, then board the train.",
          ],
        },
        {
          roundNumber: 2,
          roundType: "train-journey",
          roundName: "On the train",
          canSpeak: true,
          playerInstructions: [
            "You are on the train, and the journey has begun. While you're on the train, let's give you some basic instructions",
            "The game will instruct you when you can speak.",
            "The game will instruct you when you can not speak.",
            "Sometimes, things will happen for different players slightly out of sequence. This is normal, and helps mask the actions of some players.",
            "During this game, you will play many different mini games and quizzes. Some will allow you to speak, others will forbid it. Play close attention to the instructions, and you will be fine.",
            "Enjoy your time with your fellow passengers. When you are all ready, click Next Step to arrive at the Mansion.",
          ],
        },
        {
          roundNumber: 3,
          roundType: "arrival",
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
          canSpeak: false,
          roundName: "First round table",
          playerInstructions: [
            "You are at the first round table. The fabulous Claud arrives and instructs When you have all pressed ready, you will find out if you are innocent, or treacherous. ",
            "Put your heads down. Do not look at each other. I am about to reveal if you are innocent, or treacherous. ",
          ],
        },
        {
          roundNumber: 5,
          roundType: "first-night",
          canSpeak: false,
          roundName: "Traitor Reveal",
          playerInstructions: [
            "Rest, and prepare for the next day. You will be given a challenge, and a chance to banish a player. ",
          ],
        },
        {
          roundNumber: 6,
          roundType: "breakfast",
          canSpeak: false,
          roundName: "Breakfast",
          playerInstructions: [
            "At the breakfast table, you can enjoy a range of snacks (bringing snacks out at this point in the game really helps set the mood). You wait in trepidation to find out what players survived the night. At the end of breakfast, your daily challenge will be set. ",
          ],
        },
      ],
      playerQuizQuestions: [
        {
          question: "Which player is the most popular?",
          allPlayers: false,
          playerAnswers: [],
        },
        {
          question: "Which player is the most likely to be a treacherous?",
          allPlayers: false,
          playerAnswers: [],
        },
        {
          question: "Which player is the most trustworthy?",
          allPlayers: false,
          playerAnswers: [],
        },
        {
          question: "Who do you think has been to the most countries?",
          allPlayers: false,
          playerAnswers: [],
        },
        {
          question: "Who do you think has the most siblings?",
          allPlayers: false,
          playerAnswers: [],
        },
        {
          question: "Who makes the best cup of tea?",
          allPlayers: false,
          playerAnswers: [],
        },
      ],
      physicalActivities: [
        {
          activityId: 1,
          groupGoal:
            "As a group, find PLAYERCOUNT red objects and return to the group. If collectively you have found PLAYERCOUNT red objects before the time runs out you have won the challenge.",
          shieldGoal:
            "First to find a blue object and show it to the group wins a shield",
          done: false,
        },
        {
          activityId: 2,
          groupGoal:
            "As a group, find find PLAYERCOUNT household items. If collectively you have found PLAYERCOUNT red objects before the time runs out you have won the challenge.",
          shieldGoal:
            "The player who brings the smallest object back to the group wins a shield",
          done: false,
        },
        {
          activityId: 3,
          groupGoal:
            "Alphabet Challenge. As a group, collect objects beginning with A, B, C, D, E. If collectively you have found an object for each letter you have won the challenge.",
          shieldGoal:
            "The first player to find an object beginning with F wins a shield",
          done: false,
        },
        {
          activityId: 4,
          groupGoal:
            "Between you, find PLAYERCOUNTMINUS1 green objects. At the end of the game each player must be holding an object. If collectively you have PLAYERCOUNTMINUS1 green objects you have won the challenge.",
          shieldGoal:
            "If only one player brings back a blue object, they win a shield",
          done: false,
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

    const redisClient = new RedisClient();
    await redisClient.updateGame(gameId, game);

    res.status(201).json({ gameId, playerId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create game" });
  }
}
