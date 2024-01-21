import React, { useState } from "react";
import RoundHeader from "./round";
import PlayerStatuses from "@components/PlayerStatuses";

const RoundTable = ({ round, gameData, initialPlayer, onRoundCompleted }) => {
  const [done, setDone] = useState(initialPlayer.roundCompleted);
  const [player, setPlayer] = useState(initialPlayer);

  return (
    <>
      <RoundHeader
        roundName={round.roundName}
        playerInstruction={
          !player.voted
            ? "Discuss who you think the treacherous is. Select the player, and when you are all ready, reveal your selected player and click 'Vote'."
            : `You have voted for ${player.votedFor.playerName}`
        }
        canSpeak={true}
      />

      <b>You are voting to banish: {player.votedFor.player}</b>
      <p>
        Your vote is not final until you show all the other players and press
        VOTE
      </p>

      {gameData.players
        .every(
          (player) =>
            player.alive &&
            !player.banished &&
            !player.playerId == initialPlayer.playerId
        )
        .map((player) => (
          <button
            onClick={() => {
              setPlayer({
                ...player,
                voted: false,
                votedFor: player,
              });
            }}
          >
            Banish {player.playerName}
          </button>
        ))}

      {player.votedFor && !player.voted && (
        <button
          onClick={() => {
            fetch(
              `/api/game/${gameData.gameId}/banish?playerId=${player.playerId}&banishedPlayerId=${player.votedFor.playerId}`
            ).then((res) =>
              setPlayer({
                ...player,
                voted: true,
              })
            );
          }}
        >
          Vote
        </button>
      )}
    </>
  );
};

export default RoundTable;
