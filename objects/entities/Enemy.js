// @flow

import Entity from "./Entity";
import type { EntityType } from "../../flowTypes";
import { getDijkstraPath } from "../map/dijkstra";
import { getTileAtXY } from "../map/utilities";
import { getOrThrow } from "../../logic";

const Enemy = ({
  x,
  y,
  name,
}: {
  x: number,
  y: number,
  name: string,
}): EntityType => {
  const enemy = Object.assign(
    {},
    Entity({
      size: 64,
      x,
      y,
      name,
      type: "enemy",
      color: "rgb(100, 150, 200)",
      hp: 30,
    }),
    {
      sightRadius: 0,
      onStartTurn,
      damage: 5,
    }
  );

  return enemy;
};

const onStartTurn = function(tiles) {
  if (this.visible) {
    const { x, y } = this;
    const startTile = getOrThrow(tiles.find(getTileAtXY(x, y)));
    const endTile = getOrThrow(
      tiles.find(tile => tile.occupiedBy.some(({ type }) => type == "player"))
    );
    const { path } = getDijkstraPath(tiles, startTile, endTile);
    path.push(endTile);
    if (path[1] === undefined) {
      console.log(new Error("Already at destination!"));
      return;
    }
    const { x: targetX, y: targetY } = path[1];

    switch (true) {
      case targetX > x && targetY > y:
        this.moveDown().moveRight();
        this.onMove();
        break;
      case targetX == x && targetY > y:
        this.moveDown();
        this.onMove();
        break;
      case targetX < x && targetY > y:
        this.moveDown().moveLeft();
        this.onMove();
        break;
      case targetX < x && targetY == y:
        this.moveLeft();
        this.onMove();
        break;
      case targetX < x && targetY < y:
        this.moveLeft().moveUp();
        this.onMove();
        break;
      case targetX == x && targetY < y:
        this.moveUp();
        this.onMove();
        break;
      case targetX > x && targetY < y:
        this.moveUp().moveRight();
        this.onMove();
        break;
      case targetX > x && targetY == y:
        this.moveRight();
        this.onMove();
        break;
    }
  }
};

/*
const onCollide = function({ type }) {
  if (type === "player") {
    
  }
};
*/

export default Enemy;
