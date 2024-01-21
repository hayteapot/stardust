import React from "react";

function StartGameButton() {
  const handleClick = () => {
    fetch("/api/games/new")
      .then((response) => response.json())
      .then((data) => {
        window.location.href = `/game/${data.gameId}/${data.playerId}`;
      })
      .catch((error) => {
        console.error("Game creation failed:", error);
      });
  };

  return <button onClick={handleClick}>Start New Game</button>;
}

export default StartGameButton;
