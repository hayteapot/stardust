import React, { useState } from "react";

const NewPlayerForm = ({ playerId, gameId, submitName }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const updatePlayerSession = async (playerName) => {
    // Update player name in session
    fetch(`/api/games/${gameId}/sessions/update?playerName=${playerName}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Player session updated:", data);
      })
      .catch((error) => {
        console.error("Game creation failed:", error);
      });
  };

  const validate = () => {
    // name should be 3 to 20 characters
    if (name.length < 3 || name.length > 20) {
      setError("Name must be 3 to 20 characters");
      return;
    }

    setError(null);
    return;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    validate();

    if (error) {
      return;
    }

    updatePlayerSession(name);
    submitName(name);
  };

  return (
    <div>
      <h2>Player ID: {playerId}</h2>
      <h3>Choose your name:</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
};

export default NewPlayerForm;
