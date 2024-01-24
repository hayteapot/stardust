import React from "react";

const RoundHeader = ({ roundName, playerInstruction, canSpeak }) => {
  return (
    <div>
      {canSpeak ? (
        <b>You can speak to your fellow players.</b>
      ) : (
        <b>You may not talk at this moment - SILENCE </b>
      )}
      <h1>Location: {roundName}</h1>
      <p>{playerInstruction}</p>
    </div>
  );
};

export default RoundHeader;
