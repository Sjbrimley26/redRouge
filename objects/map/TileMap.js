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

    getTileAtXY(x: number, y: number) {
      return this.tiles.find(tile => tile.x == x && tile.y == y);
    },

    addEffectToTile(x: number, y: number, effect: EffectType) {
      let affectedTile = this.getTileAtXY(x, y);
      affectedTile.type = "trigger";
      affectedTile.color = "rgb(0, 0, 255)";
      affectedTile.collidableWith = ["player"];
      affectedTile.effect = effect;

      affectedTile.onCollide = () => {
        affectedTile.convertToGroundTile();
        map.updateTiles();
      };

      this.updateTiles();
    },

    updateTiles() {
      this.groundTiles = this.tiles.filter(isType("ground"));
      this.wallTiles = this.tiles.filter(isType("wall"));
      this.triggerTiles = this.tiles.filter(isType("trigger"));
    },

    setVisibleTiles(player: EntityType) {
      const { x, y } = player;
      map.tiles.forEach((tile: FloorTileType) => (tile.visible = false));
      const neighbors = getNeighbors(map.tiles, x, y, player.sightRadius);
      getFOV(player, neighbors);
    },

    getLineOfTiles(x1, y1, x2, y2) {
      const dy = Math.abs(y2 + 32 - (y1 + 32));
      const dx = Math.abs(x2 + 32 - (x1 + 32));
      let xFactor = x2 > x1 ? 64 : -64;
      let yFactor = y2 > y1 ? 64 : -64;
      let xyCoords = [];
      let y = y1;
      let x = x1;
      let d = dx - dy;
      let condition = true;
      while (condition) {
        xyCoords.push(getTileCoords(x, y));
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
      return xyCoords.map(tile => map.getTileAtXY(tile[0], tile[1]));
    },
  };

  return map;
};

export default createTileMap;
