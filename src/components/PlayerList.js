import React from "react";
import StatusBullet from "./StatusBullet";

function PlayerList({ users }) {
  return (
    <div>
      {users.map((user, index) => (
        <div key={index}>
          <span>{user.name}</span>
          <span style={{ margin: "50px" }} />
          <StatusBullet color={user.color} size="sm" />
          <span>{user.status}</span>
        </div>
      ))}
    </div>
  );
}

export default PlayerList;
