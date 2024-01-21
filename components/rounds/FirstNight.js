import React, { useState } from "react";
import RoundHeader from "./round";

const FirstNight = ({ round, initialPlayer, onRoundCompleted }) => {
  const [done, setDone] = useState(initialPlayer.roundCompleted);
  const [player, setPlayer] = useState(initialPlayer);
  const [step, setStep] = useState(-1);

  return (
    <>
      <RoundHeader
        roundName={round.roundName}
        playerInstruction={step === -1 ? "" : round.playerInstructions[step]}
        canSpeak={round.canSpeak}
      />

      {step === -1 && (
        <>
          <p>You are {player.treacherous ? "treacherous" : "innocent"}</p>
          {player.treacherous && (
            <p>
              You win by surviving to the end of the game. Any treacherous still
              in the game after the final round table vote will win the game.
            </p>
          )}
          <button onClick={() => setStep(step + 1)}>Next Step</button>
        </>
      )}

      {step === 0 && (
        <button
          onClick={() => {
            onRoundCompleted(player.playerId);
          }}
        >
          To breakfast!
        </button>
      )}
    </>
  );
};

export default FirstNight;
