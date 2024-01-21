import React from "react";

const PlayerStatuses = ({ game }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Player</th>
          <th>Status</th>
        </tr>
      </thead>
      {game.players.map((player) => (
        <tbody key={player.playerId}>
          <tr>
            <td>{player?.playerName}</td>
            <td>
              {!player?.alive
                ? "dead"
                : player?.banished
                ? `banished (${
                    player.treacherous ? "treacherous" : "innocent"
                  })`
                : player?.roundCompleted
                ? "Ready for next round"
                : game?.currentRound &&
                  game?.gameRounds[game.currentRound - 1]?.roundType ===
                    "breakfast"
                ? player?.readyForBreakfast
                  ? "At breakfast"
                  : "Not at breakfast"
                : "alive"}
            </td>
          </tr>
        </tbody>
      ))}
    </table>
  );
};

export default PlayerStatuses;
