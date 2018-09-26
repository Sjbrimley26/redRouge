// @flow

import sample from "lodash/sample";
import { livingTileColors } from "../tiles";
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "./config";
import { doneColliding } from "../../logic";
import type { FloorTileType, EffectType, EntityType } from "../../flowTypes";
import { generateTiles, getNeighbors } from "./mapGenerator";
import getFOV from "./fov";

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

    wallTiles: tiles.filter(isType("wall")).map(
      (tile: FloorTileType): FloorTileType => {
        tile.onCollide = (): void => doneColliding(tile);
        return tile;
      }
    ),

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
        affectedTile.type = "ground";
        affectedTile.color = sample(livingTileColors);
        affectedTile.collidableWith = [];
        affectedTile.isOpaque = false;
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

    setVisibleTiles(player: EntityType) {
      const { x, y } = player;
      map.tiles.forEach((tile: FloorTileType) => (tile.visible = false));
      const neighbors = getNeighbors(
        map.tiles,
        x,
        y,
        player.sightRadius
      ).filter(tile => tile !== undefined);
      getFOV(player, neighbors);
    },
  };

  return map;
};

export default createTileMap;
