// @flow
// https://gamedevelopment.tutsplus.com/tutorials/generate-random-cave-levels-using-cellular-automata--gamedev-9664

import sample from "lodash/sample";
import { wallTile, floorTile, livingTileColors } from "../tiles";
import type { FloorTileType } from "../../flowTypes";
import { TILE_SIZE, MAP_HEIGHT, MAP_WIDTH } from "./config";
import { get_random_number, get_new_id } from "../../utilities";
import { getOrThrow } from "../../logic";
import { getDijkstraPath, getFurthestTile } from "./dijkstra";

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
      tile.id = get_new_id();
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
    let nbs = countLivingNeighbors(tile);
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
  const maxAmountOfTreasure = 12;
  let treasurePlaced = 0;

  const place = (tile, index): void => {
    if (treasurePlaced < maxAmountOfTreasure) {
      treasurePlaced++;
    } else {
      return;
    }
    let nbs = countLivingNeighbors(tile);
    if (tile.type === "ground" && nbs === treasureLimit) {
      newMap[index].addEffect("rgb(255, 200, 0)", {
        name: "gold",
        type: "gold",
        strength: get_random_number(5, 26),
      });
    }
  };

  oldMap.forEach(place);
  return newMap;
};

const addDijkstraNeighbors = (oldMap: FloorTileType[]): FloorTileType[] => {
  const setNeighbors = (tile: FloorTileType): FloorTileType => {
    let nbs = getNeighbors(oldMap, tile.x, tile.y);
    tile.neighbors = {};
    tile.neighbors = nbs.reduce((neighborObj, neighbor) => {
      if (tile.type === "trigger" && neighbor.type !== "wall") {
        neighborObj[neighbor.id] = {
          distance: 0, // so gold is more valuable
          type: neighbor.type,
        };
        return neighborObj;
      }
      if (neighbor.type !== "wall") {
        neighborObj[neighbor.id] = {
          distance: neighbor.type === "ground" ? 1 : 0, // so gold is more valuable
          type: neighbor.type,
        };
      }
      return neighborObj;
    }, {});
    return tile;
  };

  let newMap = oldMap.map(setNeighbors);
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
      if (neighbor === undefined) {
        continue;
      }
      neighbors.push(neighbor);
    }
  }
  return neighbors;
};

const countLivingNeighbors = (tile: FloorTileType): number => {
  return Object.keys(tile.neighbors).length;
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
  Object.keys(tile.neighbors).forEach(id => {
    fill.add(map.find(t => t.id === id));
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
  console.time("generateTiles");
  let tiles = getMapOfAdequateSize(width, height, tile_size, iterations);
  console.log(
    `Map is ${(getGroundPercentage(tiles) * 100).toFixed(0)}% ground.`
  );
  tiles = addTreasure(tiles);
  tiles = addDijkstraNeighbors(tiles);
  console.timeEnd("generateTiles");
  // console.log(tiles);
  const test = () => {
    let tileA = tiles.find(getTileAtXY(64, 64));
    let tileB = getFurthestTile(tiles, tileA);
    console.log(getDijkstraPath(tiles, tileA, tileB));
  };
  test();
  /*
  console.log(
    "Tiles with trigger neighbors",
    tiles.filter(tile =>
      Object.values(tile.neighbors).some(nb => nb.type === "trigger")
    )
  );
  */
  return tiles;
};

const getMapOfAdequateSize = (
  width,
  height,
  tile_size,
  iterations,
  minimumGround = 0.45
) => {
  let tiles = spawnTiles(width, height, tile_size);
  // console.log("Initial tiles spawned.");
  tiles = addDijkstraNeighbors(tiles);
  for (let i = 0; i < iterations; i++) {
    tiles = doSimulationStep(tiles);
    tiles = addDijkstraNeighbors(tiles);
  }
  // console.log("Cellular automata simulation finished.");
  const startTile = getOrThrow(tiles.find(getTileAtXY(64, 64)));
  startTile.convertToGroundTile();
  tiles = removeTilesOutsideFill(tiles, floodFill(tiles, startTile));
  // console.log("Excess caves removed.");
  while (getGroundPercentage(tiles) < minimumGround) {
    // console.log("Map too small, resetting generation.");
    tiles = getMapOfAdequateSize(
      width,
      height,
      tile_size,
      iterations,
      minimumGround
    );
  }
  tiles = addDijkstraNeighbors(tiles);
  return tiles;
};
