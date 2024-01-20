import { useRouter } from "next/router";
import { useInterval } from "react-use";
import { useState, useEffect } from "react";

const GamePage = () => {
  const router = useRouter();
  const { gameid } = router.query;

  // State to store game data and player ID
  const [gameData, setGameData] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch game data and player information on component mount
  useInterval(async () => {
    try {
      const response = await fetch("/api/games/" + gameid);
      const data = await response.json();
      setGameData(data.gameData);
      setPlayerId(data.playerId);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, 10000); // Check every 10 seconds

  // Handle session creation if playerId is not present
  useEffect(() => {
    if (!gameid) return;

    if (!playerId) {
      const createSession = async () => {
        try {
          const response = await fetch(`/api/games/${gameid}/sessions/new`);
          const sessionData = await response.json();
          setPlayerId(sessionData.playerId);

          // Add player to the game (logic depends on your game implementation)
          // ...
        } catch (error) {
          setError(error);
        }
      };

      createSession();
    }
  }, [playerId, gameid]);

  // Conditional rendering based on loading, error, or game state
  if (loading) {
    return <div>Loading game...</div>;
  }

  if (error) {
    return <div>Error fetching game data: {error.message}</div>;
  }

  // Render game content based on playerId and gameData
  return (
    <div>
      <h1>Game ID: {gameid}</h1>
      {playerId && (
        // Render game content for player
        <p>You are player: {playerId}</p>
      )}
      {gameData && gameData.players && (
        // Render game content for all players
        <p>All layers: {gameData.players.join(", ")}</p>
      )}
      {!playerId && (
        // Render waiting for session or game start logic
        <p>Connecting....</p>
      )}
    </div>
  );
};

export default GamePage;
