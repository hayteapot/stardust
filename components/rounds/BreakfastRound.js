import React, { useState } from "react";
import RoundHeader from "./round";
import PlayerStatuses from "@components/PlayerStatuses";

const BreakfastRound = ({
  round,
  gameData,
  initialPlayer,
  onRoundCompleted,
}) => {
  const [done, setDone] = useState(initialPlayer.roundCompleted);
  const [player, setPlayer] = useState(initialPlayer);
  const [step, setStep] = useState(-1);
  const [readyForBreakfast, setReadyForBreakfast] = useState(
    initialPlayer.waitingForBreakfast
  );

  return (
    <>
      <RoundHeader
        roundName={round.roundName}
        playerInstruction={step === -1 ? "" : round.playerInstructions[0]}
        canSpeak={step === -1 ? false : round.canSpeak}
      />

      {!readyForBreakfast && step === -1 && (
        <p>
          You are not yet at breakfast, and may not speak... who knows, maybe
          the treacherous killed you in the night?
        </p>
      )}

      {readyForBreakfast &&
        step === -1 &&
        player.alive(
          <>
            <p>You survived the night. You may now go to breakfast</p>
            <button
              onClick={() => {
                setStep(step + 1);
              }}
            >
              To breakfast!
            </button>
          </>
        )}

      <PlayerStatuses game={gameData} player={player} />
    </>
  );
};

export default BreakfastRound;
