// @flow

"use strict";

import Tile from "../entities/Tile";
import sample from "lodash/sample";
import { livingTileColors, wallColor } from "./colors";

const defaultTile = {
  size: 64,
  x: 0,
  y: 0,
  visible: false,
  isOpaque: false,
};

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
    color: wallColor,
    type: "wall",
    isOpaque: true,
  });
};
