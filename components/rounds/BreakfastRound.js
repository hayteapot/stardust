import React, { useState } from "react";
import RoundHeader from "./round";
import PlayerStatuses from "@components/PlayerStatuses";

const BreakfastRound = ({
  round,
  gameData,
  currentPlayer,
  onRoundCompleted,
}) => {
  const [done, setDone] = useState(currentPlayer.roundCompleted);

  return (
    <>
      <RoundHeader
        roundName={
          currentPlayer.readyForBreakfast ? "Breakfast" : "In your room"
        }
        playerInstruction={
          currentPlayer.readyForBreakfast
            ? "You survived the night, and arrive at breakfast. You may speak to any player at breakfast "
            : "You are not yet at breakfast, and may not speak... who knows, maybe the treacherous killed you in the night? "
        }
        canSpeak={currentPlayer.readyForBreakfast}
      />

      {done && (
        <p>
          You wait nervously for claud, who will take you direct to your daily
          challenge
        </p>
      )}

      {gameData.players.every((player) => player.readyForBreakfast) &&
        !done && (
          <>
            <p>With all the players here, are we ready for Claud?</p>

            <button
              onClick={() => {
                setDone(true);
                onRoundCompleted(currentPlayer.playerId);
              }}
            >
              Morning Claud!
            </button>
          </>
        )}

      {currentPlayer.readyForBreakfast && currentPlayer.alive && (
        <>
          <PlayerStatuses game={gameData} />
        </>
      )}
    </>
  );
};

export default BreakfastRound;
