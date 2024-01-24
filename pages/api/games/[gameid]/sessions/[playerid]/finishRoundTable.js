import RedisClient from "pages/api/middleware/redisClient";

export default async function handler(req, res) {
  const gameId = req.query.gameid;
  const sessionId = req.query.playerid;

  const redisClient = new RedisClient();
  const game = await redisClient.getGameWithLock(gameId, sessionId);

  // Reset banishment states for game and all players
  game.banishState = null;
  game.playerToBanish = null;
  game.playersToBanish = null;
  game.players = game.players.map((player) => ({
    ...player,
    voted: false,
    votedFor: null,
    readyToBanish: false,
  }));

  // Banish current player
  game.players = game.players.map((player) =>
    player.playerId === sessionId ? { ...player, banished: true } : player
  );

  // Next round
  game.currentRound++;

  // Setup night time quiz
  // Count players in the game
  const playersInTheGame = game.players.filter(
    (player) => player.alive && !player.banished
  );

  // get treacherous players still in the game
  const treacherousPlayers = playersInTheGame.filter(
    (player) => player.treacherous
  );

  // Count innocent players still in the game
  const innocentPlayers = playersInTheGame.filter(
    (player) => !player.treacherous
  );

  // Determine if the treacherous players can recruit
  const canRecruit =
    treacherousPlayers.length < 3 &&
    treacherousPlayers.length + 1 <= innocentPlayers.length;

  let treacherousFirstQuestion = {};
  if (canRecruit) {
    treacherousFirstQuestion = {
      question: "Would you like to recruit, or murder",
      answerType: "boolean",
    };
  } else {
    treacherousFirstQuestion = {
      question: "Who will you murder?",
      answerType: "innocent-player-pick",
    };
  }

  // Select 6 random questions for the innocent
  const allQuestions = game.playerQuizQuestions;

  // Now select six questions at random from allQuestions
  const selectedQuestions = getUniqueRandomQuestions(allQuestions, 6);

  // Now, assign quiz questions to players
  playersInTheGame.forEach((player) => {
    player.quizQuestions = selectedQuestions;
  });

  // Assign quiz to each player, and randomise question order
  game.players.every((player) => {
    if (player.treacherous) {
      const quiz = getUniqueRandomQuestions(selectedQuestions, 2);
      quiz.push(treacherousFirstQuestion);
      player.quizQuestions = quiz;
    } else {
      const numberOfQuestions = Math.floor(Math.random() * 2) + 4;
      player.quizQuestions = getUniqueRandomQuestions(
        selectedQuestions,
        numberOfQuestions
      );
    }
  });

  await redisClient.updateGame(gameId, game);

  res.json({ gameId });
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getUniqueRandomQuestions(allQuestions, count) {
  const shuffledQuestions = shuffleArray(allQuestions);
  const uniqueQuestions = new Set();

  while (uniqueQuestions.size < count && shuffledQuestions.length > 0) {
    const question = shuffledQuestions.pop();
    uniqueQuestions.add(question);
  }

  return Array.from(uniqueQuestions);
}
