import { useRouter } from "next/router";
import { useInterval } from "react-use";
import { useState, useEffect } from "react";
import RoundTrainStation from "@components/rounds/RoundTrainStation";
import ShareGameLink from "@components/ShareGameLink";

const PlayerGamePage = () => {
  const router = useRouter();
  const { gameid, playerid } = router.query;

  // State to store game data and player ID
  const [gameData, setGameData] = useState({
    gameId: gameid,
  });
  const [currentRound, setCurrentRound] = useState(0);
  const [player, setPlayer] = useState({
    playerId: playerid,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch game data and player information on component mount
  useInterval(async () => {
    console.log("fetching game data: " + gameid);

    if (!gameid) return;

    try {
      const response = await fetch("/api/games/" + gameid);
      const data = await response.json();
      setGameData(data);

      console.log(data);
      console.log(playerid);

      // Refresh player data
      const player = data.players.find(
        (player) => player.playerId === playerid
      );

      console.log(player);

      setPlayer(player);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, 5000); // Check every 5 seconds

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
      <h1>Game ID: {gameData?.gameId}</h1>
      <ShareGameLink />
      {gameData &&
        player &&
        gameData.gameRounds &&
        gameData.gameRounds[currentRound].roundType == "train-station" && (
          <RoundTrainStation
            round={gameData.gameRounds[currentRound]}
            gameData={gameData}
            initialPlayer={player}
            onRoundCompleted={(newPlayerName) => {
              // update player
              fetch(
                `/api/games/${gameid}/sessions/${player.playerId}/update?playerName=${newPlayerName}&roundCompleted=true&alive=true&banished=false`
              );
            }}
          />
        )}
      {!player && (
        // Render waiting for session or game start logic
        <p>Connecting....</p>
      )}
    </div>
  );
};

export default PlayerGamePage;
