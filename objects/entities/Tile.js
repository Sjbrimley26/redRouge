// @flow

import { livingTileColors } from "../tiles/colors";
import sample from "lodash/sample";
import { collidable, viewable, memorable } from "./prototypes";
import { doneColliding } from "../../logic";

const Tile = function({
  size,
  x,
  y,
  color,
  type = "tile",
  collidableWith = [],
  isOpaque = false,
}) {
  return Object.assign({}, collidable, viewable, memorable, {
    x,
    y,
    type,
    color,
    size,
    height: size,
    width: size,
    collidableWith,
    isOpaque,
    convertToGroundTile,
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

export default Tile;
