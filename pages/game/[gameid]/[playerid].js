import { useRouter } from "next/router";
import { useInterval } from "react-use";
import { useState } from "react";
import RoundTrainStation from "@components/rounds/RoundTrainStation";
import SimpleTextRound from "@components/rounds/SimpleTextRound";

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
    return (
      <div>Loading game, do not refresh. This can take up to 30 seconds...</div>
    );
  }

  if (error) {
    return <div>Error fetching game data: {error.message}</div>;
  }

  // Render game content based on playerId and gameData
  return (
    <div>
      {gameData && player && gameData.gameRounds && (
        <>
          {!player.alive && <p>You are dead</p>}
          {player.banished && <p>You have been banished</p>}

          {gameData.gameRounds[currentRound - 1].roundType ==
            "train-station" && (
            <RoundTrainStation
              round={gameData.gameRounds[currentRound - 1]}
              gameData={gameData}
              initialPlayer={player}
              onRoundCompleted={onRoundCompleted}
            />
          )}

          {gameData.gameRounds[currentRound - 1].roundType ==
            "train-journey" && (
            <SimpleTextRound
              round={gameData.gameRounds[currentRound - 1]}
              gameData={gameData}
              initialPlayer={player}
              onRoundCompleted={onRoundCompleted}
              playStatus="On the train"
              completeStatus="Outside the mansion...."
            />
          )}

          {gameData.gameRounds[currentRound - 1].roundType == "arrival" && (
            <SimpleTextRound
              round={gameData.gameRounds[currentRound - 1]}
              gameData={gameData}
              initialPlayer={player}
              onRoundCompleted={onRoundCompleted}
              playStatus="Listening to Claud..."
              completeStatus="At the mansion"
            />
          )}

          {gameData.gameRounds[currentRound - 1].roundType ==
            "first-round-table" && (
            <SimpleTextRound
              round={gameData.gameRounds[currentRound - 1]}
              gameData={gameData}
              initialPlayer={player}
              onRoundCompleted={onRoundCompleted}
              playStatus="At the Round Table"
              completeStatus="Ready to find out their role"
            />
          )}

          {gameData.gameRounds[currentRound - 1].roundType == "breakfast" && (
            <BreakfastRound
              round={gameData.gameRounds[currentRound - 1]}
              gameData={gameData}
              initialPlayer={player}
              onRoundCompleted={onRoundCompleted}
              playStatus="At the Round Table"
              completeStatus="Ready to find out their role"
            />
          )}
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
