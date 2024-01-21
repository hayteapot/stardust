import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const GamePage = () => {
  const router = useRouter();
  const { gameid } = router.query;
  const [error, setError] = useState("");

  useEffect(() => {
    if (!gameid) return;

    const createSession = async () => {
      try {
        const response = await fetch(`/api/games/${gameid}/sessions/new`);
        const sessionData = await response.json();

        // Add player to the game (logic depends on your game implementation)
        window.location.href = `/game/${gameid}/${sessionData.playerId}`;
      } catch (error) {
        console.log(error);

        setError(error.data);
      }
    };

    createSession();
  }, [gameid]);

  return (
    <>
      {error !== "" && <div>{error}</div>}
      <div>Joining Game with ID: {gameid}.....</div>
    </>
  );
};

export default GamePage;
