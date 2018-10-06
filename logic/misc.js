import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "../objects/map/config";
import { EntityType } from "../flowTypes";

const relocateIfPastBorder = player => {
  const originalX = player.x;
  const originalY = player.y;

  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x > MAP_WIDTH - TILE_SIZE) {
    player.x = MAP_WIDTH - TILE_SIZE;
  }

  if (player.y < 0) {
    player.y = 0;
  }

  if (player.y > MAP_HEIGHT - TILE_SIZE) {
    player.y = MAP_HEIGHT - TILE_SIZE;
  }

  if (player.y !== originalY || player.x !== originalX) {
    player.onMove();
  }
};

const doneColliding = tile => {
  tile.isColliding = false;
  tile.collidingWith = {};
};

const checkIfPlayerHitWall = (player: EntityType | void) => {
  if (
    player !== undefined &&
    player.isColliding === true &&
    player.collidingWith.type === "wall"
  ) {
    return true;
  } else {
    return false;
  }
};

const getOrThrow = obj => {
  if (obj === undefined) {
    throw new Error("Value should never be undefined");
  }
  return obj;
};

module.exports = {
  relocateIfPastBorder,
  doneColliding,
  checkIfPlayerHitWall,
  getOrThrow,
};
