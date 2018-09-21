// @flow

"use strict";

import Sprite from "../../classes/Sprite";
import sample from "lodash/sample";

const defaultTile = {
  size: 64,
  x: 0,
  y: 0,
  visibility: "hidden",
  isOpaque: false,
};

export const livingTileColors = [
  "rgb(80, 100, 0)",
  "rgb(100, 100, 40)",
  "rgb(100, 100, 0)",
];

export const redTile = Sprite({ ...defaultTile, color: "rgb(255, 0, 0)" });

export const floorTile = function() {
  return Sprite({
    ...defaultTile,
    color: sample(livingTileColors),
    type: "ground",
  });
};

export const wallTile = function() {
  return Sprite({
    ...defaultTile,
    color: "rgb(50, 50, 50)",
    type: "wall",
    isOpaque: true,
  });
};
