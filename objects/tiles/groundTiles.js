'use strict'

import Sprite from "../../classes/Sprite";
import Tile from "../../classes/Tile";

const defaultTile = {
  size: 64,
  x: 0,
  y: 0
};

const groundTileColors = [
  "rgb(0, 255, 0)",
  "rgb(60, 100, 0)",
  "rgb(100, 200, 40)",
  "rgb(0, 0, 0)"
];

export const groundTiles = groundTileColors.map(color => {
  return Tile(
    Sprite({ 
      ...defaultTile,
      color
    }), {
      type: color == "rgb(0, 0, 0)" ? "wall" : "ground",
    }
  );
});

export const redTile = Tile(
  Sprite(
    {
      ...defaultTile,
      color: "rgb(255,0,0)",
    }
  ), {
    type: "player",
    collidableWith: [
      "wall",
      "enemy"
    ]
  }
);