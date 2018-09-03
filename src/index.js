"use strict";

import "babel-polyfill";

import "../assets/styles/global.scss";

import { debounce } from "lodash";

import {
  createTileMap,
  TILE_SIZE,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "../objects/map";

import { QuadTree, Player, Camera } from "../classes";

import {
  getCanvas,
  resizeCanvas,
  renderMultipleSprites,
  // zoomOut,
  // zoomIn
} from "../canvas";

import { detectCollision } from "../logic";

const gameMap = createTileMap();

const gameObjects = new Map();

const quadtree = QuadTree(0, {
  x: 0,
  y: 0,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
});

const player = Player();
const camera = Camera();

gameObjects.set("player", player);

player.addMovementListener("cameraTracker", player => {
  let x = player.x - camera.width / (2 * camera.zoomFactor);
  let y = player.y - camera.height / (2 * camera.zoomFactor);

  if (x % TILE_SIZE !== 0) {
    x = Math.floor(x / TILE_SIZE) * TILE_SIZE;
  }

  if (y % TILE_SIZE !== 0) {
    y = Math.floor(y / TILE_SIZE) * TILE_SIZE;
  }

  camera.relocate(x, y);
});

window.onload = () => {
  camera.resize();
  render();
  startTurn();

  gameMap.addEffectToTile(192, 128, {
    type: "poison",
    duration: 3,
  });
};

window.addEventListener(
  "resize",
  debounce(() => {
    getCanvas("background")
      .then(resizeCanvas)
      .then(canvas => renderMultipleSprites(canvas, camera, gameMap.tiles))
      .then(canvas => renderMultipleSprites(canvas, camera, gameObjects));

    camera.resize();
  }, 100),
);

const render = () => {
  getCanvas("background")
    .then(resizeCanvas)
    // .then(canvas => {
    //  camera.setZoom("zoomOut");
    //  return zoomOut(canvas);
    // })
    .then(canvas => renderMultipleSprites(canvas, camera, gameMap.tiles))
    .then(canvas => renderMultipleSprites(canvas, camera, gameObjects));

  window.requestAnimationFrame(render);
};

const startTurn = () => {
  const player = { ...gameObjects.get("player") };

  const originX = player.x;
  const originY = player.y;

  quadtree.clear();
  gameMap.wallTiles
    .concat(gameMap.triggerTiles)
    .forEach(tile => quadtree.insert(tile));

  const addKeydownMovement = e => {
    const mover = { ...gameObjects.get("player") };

    switch (e.keyCode) {
      case 37:
      case 65:
      case 100:
        mover.moveLeft();
        mover.onMove();
        break;

      case 38:
      case 87:
      case 104:
        mover.moveUp();
        mover.onMove();
        break;

      case 39:
      case 68:
      case 102:
        mover.moveRight();
        mover.onMove();
        break;

      case 40:
      case 83:
      case 98:
        mover.moveDown();
        mover.onMove();
        break;

      case 97:
        mover.moveDown().moveLeft();
        mover.onMove();
        break;

      case 103:
        mover.moveUp().moveLeft();
        mover.onMove();
        break;

      case 105:
        mover.moveUp().moveRight();
        mover.onMove();
        break;

      case 99:
        mover.moveDown().moveRight();
        mover.onMove();
        break;

      default:
        // console.log(e.keyCode, "pressed!");
        break;
    }

    const relocateIfPastBorder = player => {
      if (player.x < 0) {
        player.x = 0;
      }

      if (player.x > MAP_WIDTH - TILE_SIZE) {
        player.x = MAP_WIDTH - TILE_SIZE;
      }

      if (player.y < 0) {
        player.y = 0;
      }

      if (player.y > MAP_HEIGHT - TILE_SIZE) {
        player.y = MAP_HEIGHT - TILE_SIZE;
      }
    };

    relocateIfPastBorder(mover);

    gameObjects.set("player", mover);

    for (let sprite of gameObjects.values()) {
      quadtree.insert(sprite);
    }

    detectCollision(quadtree);

    document.removeEventListener("keydown", addKeydownMovement);

    if (
      gameObjects.get("player").isColliding &&
      gameObjects.get("player").collidingWith.type === "wall"
    ) {
      let tempPlayer = { ...gameObjects.get("player") };
      console.log(`You ran into a ${tempPlayer.collidingWith.type}`);
      tempPlayer.x = originX;
      tempPlayer.y = originY;
      gameObjects.set("player", tempPlayer);
      endTurn();
    } else if (gameObjects.get("player").isColliding) {
      // let tempPlayer = { ...gameObjects.get("player") };
      // console.log(`You stepped on a ${tempPlayer.collidingWith.type}`);
      endTurn();
    } else {
      endTurn();
    }
  };

  document.addEventListener("keydown", addKeydownMovement);

  const endTurn = () => {
    document.removeEventListener("keydown", addKeydownMovement);
    let tempPlayer = gameObjects.get("player");
    tempPlayer.collidingWith = {};
    tempPlayer.isColliding = false;
    gameObjects.set("player", tempPlayer);
    startTurn();
  };
};
