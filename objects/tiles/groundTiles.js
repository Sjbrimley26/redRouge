// @flow

"use strict";

import Tile from "../entities/Tile";
import sample from "lodash/sample";

const defaultTile = {
  size: 64,
  x: 0,
  y: 0,
  visible: false,
  isOpaque: false,
};

export const livingTileColors = [
  "rgb(80, 100, 0)",
  "rgb(100, 100, 40)",
  "rgb(100, 100, 0)",
];

export const floorTile = function() {
  return Tile({
    ...defaultTile,
    color: sample(livingTileColors),
    type: "ground",
  });
};

export const wallTile = function() {
  return Tile({
    ...defaultTile,
    color: "rgb(50, 50, 50)",
    type: "wall",
    isOpaque: true,
  });
};
