// @flow

"use strict";

import "babel-polyfill";

import "../assets/styles/global.scss";

import debounce from "lodash/debounce";

import type { EntityType, CameraType } from "../flowTypes";

import {
  createTileMap,
  // TILE_SIZE,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "../objects/map";

import { QuadTree, Camera } from "../classes";

import Player from "../objects/entities/Player";

import {
  getCanvas,
  resizeCanvas,
  renderMultipleSprites,
  // zoomOut,
  // zoomIn
} from "../canvas";

import {
  detectCollision,
  relocateIfPastBorder,
  triggerKeyAction,
  doneColliding,
  checkIfPlayerHitWall,
  getOrThrow,
} from "../logic";

const gameMap = createTileMap();

const gameObjects = new Map();

const quadtree = QuadTree(0, {
  x: 0,
  y: 0,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
});

const player: EntityType = Player();
const camera: CameraType = Camera();

gameObjects.set("player", player);

player.addMovementListener("cameraTracker", camera.trackPlayer);
player.addMovementListener("visibilityTracker", gameMap.setVisibleTiles);

const renderGameObjects = () => {
  getCanvas("background")
    .then(resizeCanvas)
    // .then(canvas => {
    //  camera.setZoom("zoomOut");
    //  return zoomOut(canvas);
    // })
    .then(canvas => renderMultipleSprites(canvas, camera, gameMap.tiles))
    .then(canvas => renderMultipleSprites(canvas, camera, gameObjects));
};

window.onload = () => {
  camera.resize();
  render();
  startTurn();
  // console.log(player);
  gameMap.setVisibleTiles(player);

  gameMap.addEffectToTile(192, 128, {
    name: "poison mushroom",
    type: "poison",
    duration: 3,
    strength: 10,
  });

  gameMap.addEffectToTile(192, 192, {
    name: "poisonous frog",
    type: "poison",
    duration: 5,
    strength: 5,
  });
};

window.addEventListener(
  "resize",
  debounce(() => {
    renderGameObjects();
    camera.resize();
  }, 100)
);

const render = () => {
  renderGameObjects();
  window.requestAnimationFrame(render);
};

const startTurn = () => {
  const player: EntityType = getOrThrow(gameObjects.get("player"));
  player.onStartTurn();

  const originX = player.x;
  const originY = player.y;

  quadtree.clear();
  gameMap.wallTiles
    .concat(gameMap.triggerTiles)
    .forEach(tile => quadtree.insert(tile));

  const addKeydownMovement = (e: any): void => {
    const mover: EntityType = getOrThrow(gameObjects.get("player"));

    triggerKeyAction(e.keyCode, mover);
    relocateIfPastBorder(mover);

    gameObjects.set("player", mover);

    for (let sprite of gameObjects.values()) {
      quadtree.insert(sprite);
    }

    detectCollision(quadtree);

    if (checkIfPlayerHitWall(gameObjects.get("player"))) {
      let tempPlayer: EntityType = getOrThrow(gameObjects.get("player"));
      console.log(`You ran into a ${tempPlayer.collidingWith.type}`);
      tempPlayer.x = originX;
      tempPlayer.y = originY;
      tempPlayer.onMove();
      gameObjects.set("player", tempPlayer);
      endTurn();
    } else {
      endTurn();
    }
  };

  document.addEventListener("keydown", addKeydownMovement);

  const endTurn = () => {
    document.removeEventListener("keydown", addKeydownMovement);
    let tempPlayer: EntityType = getOrThrow(gameObjects.get("player"));
    doneColliding(tempPlayer);
    tempPlayer.onEndTurn();
    gameObjects.set("player", tempPlayer);
    startTurn();
  };
};
