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
            ? "You survived the night, and arrive at breakfast. "
            : "You are not yet at breakfast, and may not speak... who knows, maybe the treacherous killed you in the night? "
        }
        canSpeak={player.readyForBreakfast ? false : round.canSpeak}
      />

      {done && <p>You wait nervously for claud</p>}

      {gameData.players.every((player) => player.readyForBreakfast) &&
        !done && (
          <>
            <p>With all the players here, are we ready for Claud?</p>

            <button
              onClick={() => {
                setDone(true);
                onRoundCompleted(initialPlayer.playerId);
              }}
            >
              Morning Claud!
            </button>
          </>
        )}

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
