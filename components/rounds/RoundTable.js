import React, { useState } from "react";
import RoundHeader from "./round";

const RoundTable = ({ round, gameData, currentPlayer }) => {
  const [playerReadyToBanish, setPlayerReadyToBanish] = useState(
    currentPlayer.readyToBanish
  );
  const [playerHasVoted, setPlayerHasVoted] = useState(currentPlayer.votedFor);
  const [playerToBanish, setPlayerToBanish] = useState(currentPlayer.votedFor);

  return (
    <>
      <RoundHeader
        roundName={round.roundName}
        playerInstruction={""}
        canSpeak={true}
      />

      {gameData.banishState === "revoting" && (
        <p>
          <b>
            You failed to banish a player. You must now revote in a tie-break.
          </b>
        </p>
      )}

      {(gameData.banishState === "voting" ||
        gameData.banishState === "revoting") &&
        !playerHasVoted && (
          <>
            <p>
              Discuss who you think the treacherous is. The round is not over
              until all players have voted, at which point, votes will be
              revealed.
            </p>
            <p>Select player to banish:</p>
            <ul>
              {gameData.playersToBanish
                .filter((player) => player.playerId !== currentPlayer.playerId)
                .map((player) => (
                  <li>
                    <button
                      key={player.id} // Assuming each player has a unique ID
                      onClick={() => {
                        setPlayerToBanish(player);
                      }}
                    >
                      {player.playerName}
                    </button>
                  </li>
                ))}
            </ul>

            <p>
              <b>You are voting to banish: {playerToBanish?.playerName}</b>
            </p>
            <p>
              <i>
                When you press confirm vote, the round will not end until all
                players have voted. at that point, votes will be revealed.
              </i>
            </p>

            {playerToBanish && (
              <button
                onClick={() => {
                  fetch(
                    `/api/games/${gameData.gameId}/sessions/${currentPlayer.playerId}/banish?banishedPlayerId=${playerToBanish.playerId}`
                  ).then(() => {
                    setPlayerHasVoted(true);
                  });
                }}
              >
                Confirm Vote
              </button>
            )}
          </>
        )}

      {(gameData.banishState === "voting" ||
        gameData.banishState === "revoting") &&
        playerHasVoted && (
          <div>
            <p>Waiting for other players....</p>
            <p>You have voted for {playerToBanish.playerName}</p>
          </div>
        )}

      {gameData.banishState === "revealing" && (
        <>
          <p>
            Each player should now reveal their vote, clockwise from whoever
            reveals first. At the end, press complete round table and whoever
            got the most votes is banished (no banishment if a tie)
          </p>

          <p>
            <i>You have voted to banish:</i>
          </p>

          <h3>{playerToBanish.playerName}</h3>

          <br />

          {!playerReadyToBanish && (
            <button
              onClick={() => {
                fetch(
                  `/api/games/${gameData.gameId}/sessions/${currentPlayer.playerId}/completeBanishment`
                ).then(setPlayerReadyToBanish(true));
              }}
            >
              Tally Votes
            </button>
          )}
        </>
      )}

      {gameData.banishState === "revealed" && gameData.voteSucceed && (
        <p>
          Goodbye to {gameData?.banishedPlayer?.playerName}. They were a{" "}
          {gameData?.banishedPlayer?.treacherous
            ? "treacherous player"
            : "loyal player"}{" "}
        </p>
      )}

      {gameData.banishState === "banishing" &&
        currentPlayer.playerId === gameData.playerToBanish.playerId && (
          <div>
            <p>You must stand up, reveal your role and then leave the game</p>
            <button
              onClick={() => {
                fetch(
                  `/api/games/${gameData.gameId}/sessions/${currentPlayer.playerId}/finishRoundTable`
                );
              }}
            >
              Reveal Role and Leave the Game
            </button>
          </div>
        )}
    </>
  );
};

export default RoundTable;
