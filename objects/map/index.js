 import { groundTiles } from "../tiles";
 import { sample } from "lodash";

exports.createTileMap = ( width, height ) => {
  let map = [];

  for (let i = 0; i < width; i += 64) {
    for (let j = 0; j < height; j += 64) {
      let tile = { ...sample(groundTiles) };
      tile.x = i;
      tile.y = j;
      map.push(tile);
    }
  }

  return map;
}