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

  return (
    <>
      <RoundHeader
        roundName={round.roundName}
        playerInstruction={
          player.readyForBreakfast
            ? round.playerInstructions[0]
            : "You are not yet at breakfast, and may not speak... who knows, maybe the treacherous killed you in the night? "
        }
        canSpeak={player.readyForBreakfast ? false : round.canSpeak}
      />

      {player.readyForBreakfast && player.alive && (
        <>
          <p>You survived the night, and arrive at breakfast</p>
          <PlayerStatuses game={gameData} />
        </>
      )}
    </>
  );
};

export default BreakfastRound;
