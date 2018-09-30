// @flow

import { livingTileColors } from "../tiles/colors";
import sample from "lodash/sample";
import { collidable, viewable, memorable } from "./prototypes";
import { doneColliding } from "../../logic";
import type { EffectType } from "../../flowTypes";

const Tile = function({
  size,
  x,
  y,
  color,
  type = "tile",
  collidableWith = [],
  isOpaque = false,
  neighbors = {},
}: {
  size: number,
  color: string,
  x: number,
  y: number,
  type: string,
  collidableWith: string[],
  isOpaque: boolean,
  neighbors: any,
}) {
  return Object.assign({}, collidable, viewable, memorable, {
    x,
    y,
    type,
    color,
    size,
    neighbors,
    height: size,
    width: size,
    collidableWith,
    isOpaque,
    convertToGroundTile,
    addEffect,
  });
};

const convertToGroundTile = function() {
  this.type = "ground";
  this.color = sample(livingTileColors);
  this.isOpaque = false;
  this.collidableWith = [];
  if (this.hasOwnProperty("effect")) {
    delete this.effect;
  }
  doneColliding(this);
};

const addEffect = function(color: string, effect: EffectType) {
  this.type = "trigger";
  this.color = color;
  this.collidableWith = this.collidableWith.includes("player")
    ? this.collidableWith
    : this.collidableWith.concat(["player"]);
  this.effect = effect;

  this.onCollide = () => {
    this.convertToGroundTile();
  };
};

export default Tile;
