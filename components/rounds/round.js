import React from "react";

const RoundHeader = ({ roundName, playerInstruction, canSpeak }) => {
  return (
    <div>
      <h1>Location: {roundName}</h1>
      {canSpeak ? (
        <p>You can speak to your fellow players.</p>
      ) : (
        <p>You may not talk</p>
      )}
      <p>{playerInstruction}</p>
    </div>
  );
};

export default RoundHeader;
