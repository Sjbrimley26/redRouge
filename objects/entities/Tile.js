// @flow

import { collidable, viewable, memorable } from "./prototypes";

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
  });
};

export default Tile;
