import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "../objects/map/config";
import { EntityType } from "../flowTypes";

const relocateIfPastBorder = player => {
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

module.exports = {
  relocateIfPastBorder,
  doneColliding,
  checkIfPlayerHitWall,
};