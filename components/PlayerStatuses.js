import React from "react";

const PlayerStatuses = ({ game, player }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Player</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{player?.name}</td>
          <td>
            {player?.alive
              ? "dead"
              : player?.banished
              ? `banished (${player.treacherous ? "treacherous" : "innocent"})`
              : game?.currentRound &&
                game?.rounds[game.currentRound - 1]?.roundName === "breakfast"
              ? player?.readyForBreakfast
                ? "At breakfast"
                : "Not at breakfast"
              : "alive"}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default PlayerStatuses;
