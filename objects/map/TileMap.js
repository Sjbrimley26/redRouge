// @flow

import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "./config";
import type { FloorTileType, EffectType, EntityType } from "../../flowTypes";
import { generateTiles, getNeighbors } from "./mapGenerator";
import getFOV from "./fov";
import { getTileCoords } from "./utilities";

const createTileMap = (
  width: number = MAP_WIDTH,
  height: number = MAP_HEIGHT,
  tile_size: number = TILE_SIZE
) => {
  let tiles = generateTiles(width, height, tile_size, 4);

  const isType = (type: string) => (tile: FloorTileType): boolean => {
    return tile.type === type;
  };

  const map = {
    groundTiles: tiles.filter(isType("ground")),

    wallTiles: tiles.filter(isType("wall")),

    triggerTiles: tiles.filter(isType("trigger")),

    tiles,

    getTileAtXY(x: number, y: number): FloorTileType | void {
      return this.tiles.find(tile => tile.x == x && tile.y == y);
    },

    addEffectToTile(x: number, y: number, effect: EffectType) {
      let affectedTile = this.getTileAtXY(x, y);
      affectedTile.addEffect("rgb(0, 0, 255)", effect);
      this.updateTiles();
    },

    updateTiles() {
      this.groundTiles = this.tiles.filter(isType("ground"));
      this.wallTiles = this.tiles.filter(isType("wall"));
      this.triggerTiles = this.tiles.filter(isType("trigger"));
    },

    setVisibleTiles(gameObjects: any) {
      return function(player: EntityType) {
        const { x, y, sightRadius } = player;
        const objArr = Array.from(gameObjects.values());
        let affectedTiles = map.tiles
          .filter(tile => {
            return !objArr.some(({ x, y }) => {
              return tile.x == x && tile.y == y;
            });
          })
          .concat(objArr);
        affectedTiles.forEach((tile: FloorTileType) => (tile.visible = false));
        const neighbors = getNeighbors(affectedTiles, x, y, sightRadius);
        getFOV(player, neighbors);
      };
    },

    getLineOfTiles(
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ): Array<FloorTileType> {
      const dy = Math.abs(y2 + TILE_SIZE / 2 - (y1 + TILE_SIZE / 2));
      const dx = Math.abs(x2 + TILE_SIZE / 2 - (x1 + TILE_SIZE / 2));
      let xFactor = x2 > x1 ? TILE_SIZE : -TILE_SIZE;
      let yFactor = y2 > y1 ? TILE_SIZE : -TILE_SIZE;
      let xyCoords = [];
      let y = y1;
      let x = x1;
      let d = dx - dy;
      let condition = true;
      while (condition) {
        xyCoords.push(getTileCoords(x, y));
        // if this is placed before the if statement, the origin tile is included
        if (x == x2 && y == y2) {
          condition = false;
        }
        let d2 = 2 * d;
        if (d2 > -dy) {
          d -= dy;
          x += xFactor;
        }
        if (d2 < dx) {
          d += dx;
          y += yFactor;
        }
      }
      return xyCoords
        .map((tile: number[]) => map.getTileAtXY(tile[0], tile[1]))
        .filter(tile => tile !== undefined);
    },
  };

  return map;
};

export default createTileMap;
