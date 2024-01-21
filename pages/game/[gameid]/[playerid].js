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
  const [currentRound, setCurrentRound] = useState(1);
  const [player, setPlayer] = useState({
    playerId: playerid,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch game data and player information on component mount
  useInterval(async () => {
    if (!gameid) return;

    try {
      const response = await fetch("/api/games/" + gameid);
      const data = await response.json();
      setGameData(data);
      setCurrentRound(data.currentRound);

      // Refresh player data
      const player = data.players.find(
        (player) => player.playerId === playerid
      );

      setPlayer(player);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, 5000); // Check every 5 seconds

  const onRoundCompleted = async (playerId) => {
    console.log("Initiating round completed");

    try {
      // update player
      await fetch(
        `/api/games/${gameid}/sessions/${playerId}/update/roundCompleted?roundCompleted=true`
      );

      console.log("Round completed");
    } catch (error) {
      console.error(error);
    }
  };

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
      {gameData && player && gameData.gameRounds && (
        <>
          {gameData.gameRounds[currentRound - 1].roundType ==
            "train-station" && (
            <RoundTrainStation
              round={gameData.gameRounds[currentRound]}
              gameData={gameData}
              initialPlayer={player}
              onRoundCompleted={onRoundCompleted}
            />
          )}

          {gameData.gameRounds[currentRound - 1].roundType ==
            "train-journey" && <>on the train</>}
        </>
      )}
      {!player && (
        // Render waiting for session or game start logic
        <p>Connecting....</p>
      )}
    </div>
  );
};

export default PlayerGamePage;
