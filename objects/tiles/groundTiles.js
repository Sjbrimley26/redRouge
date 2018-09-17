// @flow

"use strict";

import Sprite from "../../classes/Sprite";
import Tile from "../../classes/Tile";
import find from "lodash/find";

const defaultTile = {
  size: 64,
  x: 0,
  y: 0,
  visibility: "hidden",
  isOpaque: false,
};

export const groundTileColors = [
  "rgb(80, 100, 0)",
  "rgb(100, 100, 40)",
  "rgb(100, 100, 0)",
  "rgb(50, 50, 50)",
];

export const livingTileColors = [
  "rgb(80, 100, 0)",
  "rgb(100, 100, 40)",
  "rgb(100, 100, 0)",
];

export const groundTiles: any = groundTileColors.map((color: string) => {
  return Tile(
    Sprite({
      ...defaultTile,
      color,
    }),
    {
      type: color == "rgb(50, 50, 50)" ? "wall" : "ground",
      isOpaque: color == "rgb(50, 50, 50)" ? true : false,
    }
  );
});

export const redTile = Tile(
  Sprite(
    {
      ...defaultTile,
      color: "rgb(255, 0, 0)",
    },
    {}
  )
);

export const deadTile = find(groundTiles, {
  color: "rgb(50, 50, 50)",
});

export const livingTiles = groundTiles.filter(
  tile => tile.color !== "rgb(50, 50, 50)"
);
