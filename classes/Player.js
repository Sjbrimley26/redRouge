// @flow

import Entity from "./Entity";

const Player = () => {
  const player = Entity({ x: 64, y: 64, name: "Player", type: "player" });
  player.visibility = "visible";
  player.sightRadius = 4;
  return player;
};

export default Player;
