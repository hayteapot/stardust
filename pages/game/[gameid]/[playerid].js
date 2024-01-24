import { useRouter } from "next/router";
import { useInterval } from "react-use";
import { useState } from "react";
import RoundTrainStation from "@components/rounds/RoundTrainStation";
import SimpleTextRound from "@components/rounds/SimpleTextRound";
import FirstNight from "@components/rounds/FirstNight";
import BreakfastRound from "@components/rounds/BreakfastRound";
import PhysicalActivityRound from "@components/rounds/PhysicalActivityRound";
import RoundTable from "@components/rounds/RoundTable";

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

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/games/${gameid}/sessions/${playerid}/gameState`
      );

      const data = await response.json();
      setGameData(data);
      setCurrentRound(data.currentRound);

      // Refresh player data
      const player = data.players.find(
        (player) => player.playerId === playerid
      );

      console.log("PLAYER", player);

      setPlayer(player);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch game data and player information on component mount
  useInterval(async () => {
    if (!gameid) return;

    // If it's not breakfast, poll
    await fetchData();
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
          {player.alive && !player.banished && (
            <>
              <h3>You are {player.playerName}</h3>
              <p>
                You are a{" "}
                {player.treacherous ? "treacherous player" : "innocent player"}
              </p>
              <p>
                {player.hasShield &&
                  "You have a shield, and cannot be murdered tonight"}
              </p>

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

              {gameData.gameRounds[currentRound - 1].roundType ==
                "breakfast" && (
                <BreakfastRound
                  round={gameData.gameRounds[currentRound - 1]}
                  gameData={gameData}
                  currentPlayer={player}
                  onRoundCompleted={onRoundCompleted}
                  playStatus="At the Round Table"
                  completeStatus="Ready to find out their role"
                />
              )}

              {gameData.gameRounds[currentRound - 1].roundType ==
                "round-table" && (
                <RoundTable
                  round={gameData.gameRounds[currentRound - 1]}
                  gameData={gameData}
                  currentPlayer={player}
                />
              )}

              {gameData.gameRounds[currentRound - 1].roundType ==
                "first-night" && (
                <FirstNight
                  round={gameData.gameRounds[currentRound - 1]}
                  gameData={gameData}
                  initialPlayer={player}
                  onRoundCompleted={onRoundCompleted}
                />
              )}

              {gameData.gameRounds[currentRound - 1].roundType ==
                "physical-activity" && (
                <PhysicalActivityRound
                  activityId={gameData.gameRounds[currentRound - 1].activityId}
                  leadPlayerId={
                    gameData.gameRounds[currentRound - 1].leadPlayerId
                  }
                  leadPlayerName={
                    gameData.gameRounds[currentRound - 1].leadPlayerName
                  }
                  shieldGoal={gameData.gameRounds[currentRound - 1].shieldGoal}
                  groupGoal={gameData.gameRounds[currentRound - 1].groupGoal}
                  players={gameData.gameRounds[currentRound - 1].players}
                  isActivityCompleted={
                    gameData.gameRounds[currentRound - 1].activityCompleted
                  }
                  prizePot={gameData.gameRounds[currentRound - 1].prizePot}
                  canSpeak={gameData.gameRounds[currentRound - 1].canSpeak}
                  gameId={gameData.gameId}
                  currentPlayer={player}
                />
              )}
            </>
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
