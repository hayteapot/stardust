import React, { useState } from "react";
import RoundHeader from "./round";
import NewPlayerForm from "@components/NewPlayerForm";

const RoundTrainStation = ({
  round,
  gameData,
  initialPlayer,
  onRoundCompleted,
}) => {
  const [departed, setDeparted] = useState(false);
  const [player, setPlayer] = useState(initialPlayer);
  const [step, setStep] = useState(0);

  return (
    <>
      <RoundHeader
        roundName={round.roundName}
        playerInstruction={round.playerInstructions[step]}
        canSpeak={round.canSpeak}
      />{" "}
      {player.playerName && (
        <p>
          You are: {player.playerId}:{player.playerName}
          {departed}
        </p>
      )}
      {gameData.players.length > 3 && step === 1 && (
        <button
          onClick={() => {
            setDeparted(true);
            onRoundCompleted(player.playerName);
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
      {gameData?.players?.map((player) => (
        <p key={player?.playerId}>
          {player?.playerId} - {player?.playerName} -{" "}
          {player?.ready ? "Ready" : "Not ready"}
        </p>
      ))}
    </>
  );
};

export default RoundTrainStation;
