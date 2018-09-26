// @flow
// https://gamedevelopment.tutsplus.com/tutorials/generate-random-cave-levels-using-cellular-automata--gamedev-9664

import sample from "lodash/sample";
import { wallTile, floorTile, livingTileColors } from "../tiles";
import type { FloorTileType } from "../../flowTypes";
import { TILE_SIZE, MAP_HEIGHT, MAP_WIDTH } from "./config";
import { doneColliding } from "../../logic";

const getTileAtXY = (x, y) => tile => {
  return tile.x === x && tile.y === y;
};

const spawnTiles = (width, height, tile_size): FloorTileType[] => {
  let tiles = [];
  const chanceToStartAlive = 0.46;
  for (let i = 0; i < width; i += tile_size) {
    for (let j = 0; j < height; j += tile_size) {
      let tile;
      if (Math.random() < chanceToStartAlive) {
        tile = floorTile();
      } else {
        tile = wallTile();
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
  let newMap = [];

  const simulate = (tile, index): void => {
    let nbs = countLivingNeighbors(oldMap, tile.x, tile.y);
    if (oldMap[index].type === "ground") {
      if (nbs >= deathLimit) {
        newMap[index] = {
          ...oldMap[index],
          type: "wall",
          color: "rgb(50, 50, 50)",
          isOpaque: true,
        };
        // newMap[index] = wallTile(); is too slow
      } else {
        newMap[index] = { ...oldMap[index] };
      }
    } else {
      if (nbs <= birthLimit) {
        newMap[index] = {
          ...oldMap[index],
          type: "ground",
          color: sample(livingTileColors),
          isOpaque: false,
        };
      } else {
        newMap[index] = { ...oldMap[index] };
      }
    }
  };

  oldMap.forEach(simulate);
  return newMap;
};

const addTreasure = (oldMap: FloorTileType[]): FloorTileType[] => {
  const treasureLimit = 3;
  let newMap = [...oldMap];

  const place = (tile, index): void => {
    let nbs = countLivingNeighbors(oldMap, tile.x, tile.y);
    if (tile.type === "ground" && nbs === treasureLimit) {
      newMap[index] = {
        ...newMap[index],
        type: "trigger",
        color: "rgb(255, 200, 0)",
        isOpaque: true,
        collidableWith: ["player"],
        onCollide() {
          console.log("You found some gold!");
          doneColliding(this);
        },
      };
    }
  };

  oldMap.forEach(place);
  return newMap;
};

export const getNeighbors = (
  map: FloorTileType[],
  x: number,
  y: number,
  distance: number = 1
): FloorTileType[] => {
  let neighbors = [];
  for (let i = -distance; i < distance + 1; i++) {
    for (let j = -distance; j < distance + 1; j++) {
      if (i == 0 && j == 0) {
        // exclude the tile in question
        continue;
      }
      let neighborX = x + i * TILE_SIZE;
      let neighborY = y + j * TILE_SIZE;

      if (
        neighborX < 0 ||
        neighborY < 0 ||
        neighborX >= MAP_WIDTH ||
        neighborY >= MAP_HEIGHT
      ) {
        continue;
      }

      let neighbor = map.find(getTileAtXY(neighborX, neighborY));
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
    /*
    if (
      // include tiles past the edge of the map, this conditional is optional
      neighbor == undefined
    ) {
      count++;
    }
    */
    if (neighbor.type !== "wall") {
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
): FloorTileType[] => {
  const { x, y } = tile;
  alreadyChecked.push([x, y]);
  getNeighbors(map, x, y).forEach(neighbor => {
    if (neighbor.type !== "wall") {
      fill.add(neighbor);
    }
  });
  fill.forEach(neighbor => {
    if (
      alreadyChecked.some(([x, y]) => {
        return neighbor.x === x && neighbor.y === y;
      }) === false
    ) {
      floodFill(map, neighbor, fill, alreadyChecked);
    }
  });
  return Array.from(fill);
};

const removeTilesOutsideFill = (
  map: FloorTileType[],
  fill: FloorTileType[]
): FloorTileType[] => {
  // this is kinda cool if you do the console, it shows how many times the
  // map generator had to reset
  // console.log(fill);
  return map.map(
    (tile: FloorTileType): FloorTileType => {
      if (!fill.includes(tile)) {
        tile.color = "rgb(50, 50, 50)";
        tile.type = "wall";
        tile.isOpaque = true;
      }
      return tile;
    }
  );
};

const getGroundPercentage = (map: FloorTileType[]): number => {
  const total = map.length;
  const floorCount = map.reduce((count, tile) => {
    if (tile.type == "ground") {
      count++;
    }
    return count;
  }, 0);
  return parseFloat((floorCount / total).toFixed(2));
};

export const generateTiles = (
  width: number,
  height: number,
  tile_size: number,
  iterations: number
): FloorTileType[] => {
  let tiles = spawnTiles(width, height, tile_size);
  for (let i = 0; i < iterations; i++) {
    tiles = doSimulationStep(tiles);
  }
  tiles = removeTilesOutsideFill(tiles, floodFill(tiles, { x: 64, y: 64 }));
  while (getGroundPercentage(tiles) < 0.45) {
    tiles = generateTiles(width, height, tile_size, iterations);
  }
  tiles = addTreasure(tiles);
  return tiles;
};
