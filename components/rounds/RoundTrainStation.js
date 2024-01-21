import React, { useState } from "react";
import RoundHeader from "./round";
import NewPlayerForm from "@components/NewPlayerForm";
import ShareGameLink from "@components/ShareGameLink";

const RoundTrainStation = ({
  round,
  gameData,
  initialPlayer,
  onRoundCompleted,
}) => {
  const [departed, setDeparted] = useState(initialPlayer.roundCompleted);
  const [player, setPlayer] = useState(initialPlayer);
  const [step, setStep] = useState(initialPlayer.playerName ? 1 : 0);

  return (
    <>
      <RoundHeader
        roundName={round.roundName}
        playerInstruction={round.playerInstructions[step]}
        canSpeak={round.canSpeak}
      />
      <ShareGameLink />
      {player.playerName && <p>You are: {player.playerName}</p>}
      {gameData.players.length > 3 && step === 1 && !departed && (
        <button
          onClick={() => {
            setDeparted(true);
            onRoundCompleted(initialPlayer.playerId);
          }}
        >
          Board the train
        </button>
      )}
      {!player.playerName && (
        <NewPlayerForm
          gameId={gameData.gameId}
          playerId={player.playerId}
          submitName={(name) => {
            setPlayer({
              ...player,
              playerName: name,
            });
            setStep(1);
          }}
        />
      )}
      <h2>Player Statuses:</h2>
      {gameData?.players?.map((player) => (
        <p key={player?.playerId}>
          {player?.playerName} -{" "}
          {player?.roundCompleted
            ? "On the train"
            : "On the platform (Not ready)"}
        </p>
      ))}
    </>
  );
};

export default RoundTrainStation;
