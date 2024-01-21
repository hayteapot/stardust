import React, { useState } from "react";
import RoundHeader from "./round";

const SimpleTextRound = ({
  round,
  gameData,
  initialPlayer,
  onRoundCompleted,
  playStatus,
  completeStatus,
}) => {
  const [done, setDone] = useState(initialPlayer.roundCompleted);
  const [player, setPlayer] = useState(initialPlayer);
  const [step, setStep] = useState(0);

  return (
    <>
      <RoundHeader
        roundName={round.roundName}
        playerInstruction={round.playerInstructions[step]}
        canSpeak={round.canSpeak}
      />

      {done ? (
        <p>Waiting for other players...</p>
      ) : (
        <button
          onClick={() => {
            if (round.playerInstructions.length === step + 1) {
              setDone(true);
              onRoundCompleted(initialPlayer.playerId);
            } else {
              setStep(step + 1);
            }
          }}
        >
          Next Step
        </button>
      )}

      <h2>Player Statuses:</h2>
      {gameData?.players?.map((player) => (
        <p key={player?.playerId}>
          {player?.playerName} -{" "}
          {player?.roundCompleted ? completeStatus : playStatus}
        </p>
      ))}
    </>
  );
};

export default SimpleTextRound;
