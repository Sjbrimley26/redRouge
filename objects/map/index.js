import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "./config";
import createTileMap from "./TileMap";
import { getNeighbors } from "./mapGenerator";

module.exports = {
  createTileMap,
  MAP_HEIGHT,
  MAP_WIDTH,
  TILE_SIZE,
  getNeighbors,
};
