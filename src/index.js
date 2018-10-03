// @flow

"use strict";

import "babel-polyfill";

import "../assets/styles/global.scss";

import debounce from "lodash/debounce";
import sample from "lodash/sample";

import type { EntityType, CameraType } from "../flowTypes";

import {
  createTileMap,
  // TILE_SIZE,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "../objects/map";

import { livingTileColors } from "../objects/tiles/colors";

import { getTileCoords } from "../objects/map/utilities";

import { QuadTree, Camera, MessageBoard } from "../classes";

import Player from "../objects/entities/Player";
import Enemy from "../objects/entities/Enemy";

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

import { getMultiplePaths } from "../objects/map/dijkstra";

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

const { x: enemyX, y: enemyY } = sample(
  gameMap.groundTiles.filter(tile => tile.x > 256 && tile.y > 256)
);
const sampleEnemy = Enemy({ x: enemyX, y: enemyY, name: "enemy1" });
console.log(sampleEnemy);

gameObjects.set("player", player);
gameObjects.set(sampleEnemy.id, sampleEnemy);

const showPathToClosestGold = map => player => {
  map.tiles.map(tile => {
    if (tile.color === "rgb(255, 0, 255)" && tile.type === "ground") {
      tile.color = sample(livingTileColors);
    }
    if (tile.color === "rgb(255, 0, 255)" && tile.type === "trigger") {
      tile.color = "rgb(255, 200, 0)";
    }
    if (tile.color === "rgb(255, 0, 255)" && tile.type === "wall") {
      tile.color = "rgb(50, 50, 50)";
    }
    return tile;
  });

  const goldTiles = map.tiles.filter(tile => tile.type === "trigger");
  if (goldTiles.length < 1) {
    // console.log("No more gold to find!");
    return;
  }
  console.time("get path to gold");
  const goldPaths = getMultiplePaths(
    map.tiles,
    map.getTileAtXY(player.x, player.y),
    goldTiles
  );
  if (goldPaths === undefined) {
    return console.log(new Error("Paths not found!"));
  }
  goldPaths.sort((a, b) => {
    return a.distance - b.distance;
  });
  goldPaths[0].path.forEach(tile => {
    tile.color = "rgb(255, 0, 255)";
  });
  console.timeEnd("get path to gold");
};

player.addMovementListener("cameraTracker", camera.trackPlayer);

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
  gameMap.setVisibleTiles(gameObjects)(player);
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
      if (tilesInALine.length === 0) {
        return console.log("No line available");
      }
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
  player.removeMovementListener("goldPath");
  player.removeMovementListener("visibilityTracker");
  player.addMovementListener(
    "goldPath",
    debounce(showPathToClosestGold(gameMap), 100)
  );
  player.addMovementListener(
    "visibilityTracker",
    gameMap.setVisibleTiles(gameObjects)
  );

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
