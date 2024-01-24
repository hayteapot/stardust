import React from "react";
import RoundHeader from "./round";

const ActivityRound = ({
  leadPlayerId,
  leadPlayerName,
  roundName,
  roundComponents,
  currentPlayer,
  canSpeak,
}) => {
  return (
    <>
      <RoundHeader
        roundName={roundName}
        playerInstruction={""}
        canSpeak={canSpeak}
      />

      {!currentPlayer && <p>Travelling to activity...</p>}

      {leadPlayerId != currentPlayer?.playerId && (
        <>
          <h2>This task is being led by {leadPlayerName}</h2>
          <p>
            {leadPlayerName} will provide instructions and you must follow them
          </p>
          <p>
            {leadPlayerName} is responsible for ensuring that all players
            complete the task and will faithfully report the results to Claud
          </p>
        </>
      )}

      {leadPlayerId == currentPlayer?.playerId && (
        <>
          <h2>You are the lead player for this round</h2>
          <p>
            You must follow the instructions Claud has given you closely,
            communicate them to the team, and lead the tasks
          </p>
          {roundComponents}
        </>
      )}
    </>
  );
};

export default ActivityRound;
