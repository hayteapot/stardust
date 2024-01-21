import React, { useState, useEffect } from "react";
import RoundHeader from "./round";
import PlayerStatuses from "@components/PlayerStatuses";

const QuizRound = ({ round, gameData, initialPlayer, onRoundCompleted }) => {
  const [done, setDone] = useState(initialPlayer.roundCompleted);
  const [player, setPlayer] = useState(initialPlayer);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // Select questions based on player role
    const selectedQuestions = player.treacherous
      ? gameData.treacherousQuizQuestions
      : gameData.innocentQuizQuestions;

    setQuestions(selectedQuestions);
  }, [
    player.treacherous,
    gameData.treacherousQuizQuestions,
    gameData.innocentQuizQuestions,
  ]);

  const handleAnswer = (answerPlayerId) => {
    // Store the answer for the current question
    setAnswers({
      ...answers,
      [questions[currentQuestionIndex]]: answerPlayerId,
    });

    // Move to the next question
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  return (
    <>
      <RoundHeader
        roundName={round.roundName}
        playerInstruction={
          player.readyForQuiz
            ? "You are ready for the quiz round."
            : "You are not yet ready for the quiz. Wait for others to finish their questions."
        }
        canSpeak={player.readyForQuiz ? false : round.canSpeak}
      />

      {done && <p>You wait for others to finish the quiz.</p>}

      {gameData.players.every((player) => player.readyForQuiz) && !done && (
        <>
          <p>Are we all done with the quiz?</p>

          <button
            onClick={() => {
              setDone(true);
              onRoundCompleted(initialPlayer.playerId);
            }}
          >
            Done
          </button>
        </>
      )}

      {player.readyForQuiz && player.alive && (
        <>
          <p>You are ready for the quiz.</p>

          {currentQuestionIndex < questions.length ? (
            <>
              <p>{questions[currentQuestionIndex]}</p>

              <div>
                {gameData.players
                  .filter(
                    (otherPlayer) => otherPlayer.playerId !== player.playerId
                  )
                  .map((otherPlayer) => (
                    <button
                      key={otherPlayer.playerId}
                      onClick={() => handleAnswer(otherPlayer.playerId)}
                    >
                      {otherPlayer.playerName}
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <p>Quiz completed!</p>
          )}

          <PlayerStatuses game={gameData} />
        </>
      )}
    </>
  );
};

export default QuizRound;
