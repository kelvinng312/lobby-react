import React from "react";
import StatusBullet from "./StatusBullet";

function PlayerList({ players }) {
  return (
    <div>
      {players.map((player, index) => (
        <div key={index}>
          <span style={{ width: "200px", display: "inline-block" }}>{player.playerName}</span>
          <StatusBullet color={player.color} size="sm" />
          <span style={{ width: "120px", display: "inline-block" }}>{player.playerStatus}</span>
        </div>
      ))}
    </div>
  );
}

export default PlayerList;
