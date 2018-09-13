// @flow

import { groundTiles } from "../tiles";
import sample from "lodash/sample";
import find from "lodash/find";
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "./config";
import { doneColliding } from "../../logic";
import type { FloorTileType, EffectType } from "../../flowTypes";

const createTileMap = (
  width: number = MAP_WIDTH,
  height: number = MAP_HEIGHT,
  tile_size: number = TILE_SIZE
) => {
  let tiles = [];

  for (let i = 0; i < width; i += tile_size) {
    for (let j = 0; j < height; j += tile_size) {
      let tile = {
        ...sample(groundTiles),
      };
      tile.x = i;
      tile.y = j;
      tiles.push(tile);
    }
  }

  const isType = (type: string) => (tile: FloorTileType): boolean => {
    return tile.type === type;
  };

  const map = {
    groundTiles: tiles.filter(isType("ground")),

    wallTiles: tiles.filter(isType("wall")).map(
      (tile: FloorTileType): FloorTileType => {
        tile.onCollide = (): void => doneColliding(tile);
        return tile;
      }
    ),

    triggerTiles: tiles.filter(isType("trigger")),

    tiles,

    getTileAtXY(x: number, y: number) {
      return find(this.tiles, {
        x: x,
        y: y,
      });
    },

    addEffectToTile(x: number, y: number, effect: EffectType) {
      let affectedTile = this.getTileAtXY(x, y);
      affectedTile.type = "trigger";
      affectedTile.color = "rgb(0, 0, 255)";
      affectedTile.collidableWith = ["player"];
      affectedTile.effect = effect;

      affectedTile.onCollide = () => {
        affectedTile.type = "ground";
        affectedTile.color = "rgb(0, 255, 0)";
        affectedTile.collidableWith = [];
        delete affectedTile.effect;
        doneColliding(affectedTile);
        map.updateTiles();
      };

      this.updateTiles();
    },

    updateTiles() {
      this.groundTiles = this.tiles.filter(isType("ground"));
      this.wallTiles = this.tiles.filter(isType("wall")).map(tile => {
        tile.onCollide = () => doneColliding(tile);
        return tile;
      });
      this.triggerTiles = this.tiles.filter(isType("trigger"));
    },
  };

  return map;
};

export default createTileMap;
