import { Sprite, Tile } from "../../classes";

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

const groundTiles = groundTileColors.map(color => {
  return Tile(
    Sprite({ 
      ...defaultTile,
      color
    }), {
      type: color == "rgb(0, 0, 0)" ? "wall" : "ground",
    }
  );
});

const redTile = Tile(
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

module.exports = {
  groundTiles,
  redTile
};