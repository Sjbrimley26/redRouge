 import { groundTiles } from "../tiles";
 import { sample, find } from "lodash";
 import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "./config"

const createTileMap = (
  width = MAP_WIDTH, 
  height = MAP_HEIGHT, 
  tile_size = TILE_SIZE 
) => {

  let tiles = [];

  for (let i = 0; i < width; i += tile_size) {
    for (let j = 0; j < height; j += tile_size) {
      let tile = { ...sample(groundTiles) };
      tile.x = i;
      tile.y = j;
      tiles.push(tile);
    }
  }

  const map = {
    tiles,

    getTileAtXY( x, y ) {
      return find(this.tiles, {'x': x, 'y': y});
    }
  }

  return map;
}

module.exports = {
  createTileMap,
  MAP_HEIGHT,
  MAP_WIDTH,
  TILE_SIZE
};