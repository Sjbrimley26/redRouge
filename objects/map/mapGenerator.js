// @flow
// https://gamedevelopment.tutsplus.com/tutorials/generate-random-cave-levels-using-cellular-automata--gamedev-9664

import sample from "lodash/sample";
import { deadTile, livingTiles, livingTileColors } from "../tiles";
import type { FloorTileType } from "../../flowTypes";
import { TILE_SIZE } from "./config";

const spawnTiles = (width, height, tile_size): FloorTileType[] => {
  let tiles = [];
  const chanceToStartAlive = 0.45;
  for (let i = 0; i < width; i += tile_size) {
    for (let j = 0; j < height; j += tile_size) {
      let tile;
      if (Math.random() < chanceToStartAlive) {
        tile = { ...sample(livingTiles) };
      } else {
        tile = { ...deadTile };
      }
      tile.x = i;
      tile.y = j;
      tiles.push(tile);
    }
  }
  return tiles;
};

const doSimulationStep = (oldMap: FloorTileType[]): FloorTileType[] => {
  const deathLimit = 3;
  const birthLimit = 4;
  let newMap = [...oldMap];
  oldMap.forEach((tile, index) => {
    let nbs = countLivingNeighbors(oldMap, tile.x, tile.y);
    if (oldMap[index].type === "ground") {
      if (nbs >= deathLimit) {
        newMap[index] = {
          ...newMap[index],
          color: "rgb(0, 0, 0)",
          type: "wall",
        };
      }
    } else {
      if (nbs <= birthLimit) {
        newMap[index] = {
          ...newMap[index],
          color: sample(livingTileColors),
          type: "ground",
        };
      }
    }
  });
  return newMap;
};

const getNeighbors = (map, x, y) => {
  let neighbors = [];
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i == 0 && j == 0) {
        // exclude the tile in question
        continue;
      }
      let neighborX = x + i * TILE_SIZE;
      let neighborY = y + j * TILE_SIZE;
      let neighbor = map.find(t => {
        return t.x == neighborX && t.y == neighborY;
      });
      neighbors.push(neighbor);
    }
  }
  return neighbors;
};

const countLivingNeighbors = (
  map: FloorTileType[],
  x: number,
  y: number
): number => {
  let count = 0;
  getNeighbors(map, x, y).forEach(neighbor => {
    if (
      // include tiles past the edge of the map, this conditional is optional
      neighbor == undefined
    ) {
      count++;
    }

    if (neighbor !== undefined && neighbor.type !== "wall") {
      count++;
    }
  });
  return count;
};

// I'm using 64 and 64 each time since that is the players' start location
const floodFill = (
  map: FloorTileType[],
  tile,
  fill = new Set(),
  alreadyChecked = []
) => {
  const { x, y } = tile;
  alreadyChecked.push(
    map.indexOf(
      map.find(t => {
        return t.x == x && t.y == y;
      })
    )
  );
  getNeighbors(map, x, y).forEach(neighbor => {
    if (neighbor !== undefined && neighbor.type !== "wall") {
      fill.add(neighbor);
    }
  });
  fill.forEach(neighbor => {
    if (!alreadyChecked.includes(map.indexOf(neighbor))) {
      floodFill(map, neighbor, fill, alreadyChecked);
    }
  });
  return Array.from(fill);
};

const removeTilesOutsideFill = (
  map: FloorTileType[],
  fill: FloorTileType[]
): FloorTileType[] => {
  return map.map(
    (tile: FloorTileType): FloorTileType => {
      if (!fill.includes(tile)) {
        tile.color = "rgb(0, 0, 0)";
        tile.type = "wall";
      }
      return tile;
    }
  );
};

const getGroundPercentage = (map: FloorTileType[]): number => {
  const total = map.length;
  const floorCount = floodFill(map, { x: 64, y: 64 }).length;
  return parseFloat((floorCount / total).toFixed(2));
};

export const generateTiles = (
  width: number,
  height: number,
  tile_size: number,
  iterations: number
) => {
  let tiles = spawnTiles(width, height, tile_size);
  for (let i = 0; i < iterations; i++) {
    tiles = doSimulationStep(tiles);
  }
  tiles = removeTilesOutsideFill(tiles, floodFill(tiles, { x: 64, y: 64 }));
  while (getGroundPercentage(tiles) < 0.45) {
    tiles = generateTiles(width, height, tile_size, iterations);
  }
  return tiles;
};
