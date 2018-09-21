// @flow

import Entity from "./Entity";

const Player = () => {
  const player = new Entity(
    { size: 64, color: "rgb(255, 0, 0)" },
    64,
    64,
    "Player",
    "player"
  );
  player.visibility = "visible";
  player.sightRadius = 4;
  return player;
};

export default Player;
