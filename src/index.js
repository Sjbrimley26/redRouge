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

import { getTileCoords } from "../objects/map/utilities";

import { QuadTree, Camera, MessageBoard } from "../classes";

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
  actionKeys,
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

  /*
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
  */

  document.addEventListener(
    "click",
    (e: MouseEvent): void => {
      const { clientX, clientY } = e;
      const [tileX, tileY] = getTileCoords(
        clientX + camera.x,
        clientY + camera.y
      );
      const { x, y } = getOrThrow(gameObjects.get("player"));
      const tilesInALine = gameMap.getLineOfTiles(x, y, tileX, tileY);
      let colorValue = 100;
      tilesInALine.forEach(tile => {
        const originalColor = tile.color;
        tile.color = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
        colorValue += 20;
        setTimeout(() => {
          tile.color = originalColor;
        }, 2000);
      });
    }
  );
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
  // messageBoard.log("New turn");
  const player: EntityType = getOrThrow(gameObjects.get("player"));
  player.onStartTurn();
  /*
    This updateTiles is for the gold, since the collision function is added during generation
    instead of through the gameMap.addEffectToTile, so the gold's collision listener 
    has no reference to the gameMap object, and thus can't trigger the refresh, unlike the
    collision listeners added by the addEffectToTile method.
  */
  gameMap.updateTiles();

  const visibleTiles = gameMap.tiles.filter(tile => tile.visible);
  const visibleEnemies = visibleTiles.filter(tile => tile.type === "enemy");

  if (visibleEnemies > 0) {
    console.log(visibleEnemies);
  }

  const originX = player.x;
  const originY = player.y;

  quadtree.clear();
  gameMap.wallTiles
    .concat(gameMap.triggerTiles)
    .forEach(tile => quadtree.insert(tile));

  const addKeydownMovement = (e: any): void => {
    const mover: EntityType = getOrThrow(gameObjects.get("player"));

    triggerKeyAction(e.keyCode, mover);
    if (actionKeys.includes(e.keyCode)) {
      relocateIfPastBorder(mover);

      gameObjects.set("player", mover);

      for (let sprite of gameObjects.values()) {
        quadtree.insert(sprite);
      }

      detectCollision(quadtree);

      if (checkIfPlayerHitWall(gameObjects.get("player"))) {
        let tempPlayer: EntityType = getOrThrow(gameObjects.get("player"));
        MessageBoard.log(`You ran into a ${tempPlayer.collidingWith.type}`);
        tempPlayer.x = originX;
        tempPlayer.y = originY;
        tempPlayer.onMove();
        gameObjects.set("player", tempPlayer);
        endTurn();
      } else {
        endTurn();
      }
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
