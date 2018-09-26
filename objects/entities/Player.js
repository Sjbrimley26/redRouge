// @flow

import Entity from "./Entity";

const Player = () => {
  const player: any = Entity({
    size: 64,
    color: "rgb(255, 0, 0)",
    x: 64,
    y: 64,
    name: "Player",
    type: "player",
  });
  player.visible = true;
  player.sightRadius = 4;
  return player;
};

export default Player;
