// @flow

"use strict";

import "babel-polyfill";

import "../assets/styles/global.scss";

import debounce from "lodash/debounce";
import sample from "lodash/sample";

import type { EntityType } from "../flowTypes";

import {
  createTileMap,
  // TILE_SIZE,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "../objects/map";

/*
import { livingTileColors, wallColor } from "../objects/tiles/colors";
*/

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

import {
  // getMultiplePaths,
  getDijkstraPath,
} from "../objects/map/dijkstra";

const gameMap = createTileMap();

const gameObjects = new Map();

const quadtree = QuadTree(0, {
  x: 0,
  y: 0,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
});

const player: EntityType = Player();

const spawnEnemies = (tiles, objects, numberOfEnemies) => {
  const spawnableTiles = tiles.filter(tile => tile.x > 256 && tile.y > 256);
  for (let i = 0; i < numberOfEnemies; i++) {
    const spawnLocation = sample(spawnableTiles);
    const { x, y } = spawnLocation;
    spawnableTiles.splice(spawnableTiles.indexOf(spawnLocation), 1);
    const enemy = Enemy({ x, y, name: "enemy" });
    console.log("Enemy coords:", enemy.x, enemy.y);
    objects.set(enemy.id, enemy);
  }
};

spawnEnemies(gameMap.groundTiles, gameObjects, 20);
gameObjects.set("player", player);

/*
const showPathToClosestGold = map => player => {
  map.tiles.map(tile => {
    if (tile.color === "rgb(150, 70, 80)" && tile.type === "ground") {
      tile.color = sample(livingTileColors);
    }
    if (tile.color === "rgb(150, 70, 80)" && tile.type === "trigger") {
      tile.color = "rgb(255, 200, 0)";
    }
    if (tile.color === "rgb(150, 70, 80)" && tile.type === "wall") {
      tile.color = wallColor;
    }
    return tile;
  });

  const goldTiles = map.tiles.filter(tile => tile.type === "trigger");
  if (goldTiles.length < 1) {
    return;
  }
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
    tile.color = "rgb(150, 70, 80)";
  });
};
*/

player.addMovementListener("CameraTracker", Camera.trackPlayer);

const renderGameObjects = () => {
  const objArr = Array.from(gameObjects.values());
  const viewableTiles = gameMap.tiles.filter(tile => {
    return !objArr.some(({ x, y }) => {
      return x == tile.x && y == tile.y;
    });
  });
  getCanvas("background")
    .then(resizeCanvas)
    // .then(canvas => {
    //  Camera.setZoom("zoomOut");
    //  return zoomOut(canvas);
    // })
    .then(canvas => renderMultipleSprites(canvas, Camera, viewableTiles))
    .then(canvas => renderMultipleSprites(canvas, Camera, gameObjects));
};

window.onload = () => {
  Camera.resize();
  render();
  startTurn();
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
        clientX + Camera.x,
        clientY + Camera.y
      );
      const player = getOrThrow(gameObjects.get("player"));
      const { x, y } = player;
      let tilesInALine = gameMap.getLineOfTiles(x, y, tileX, tileY);
      if (tilesInALine.length === 0) {
        return console.log("No line available");
      }
      if (tilesInALine.some(tile => tile.type == "wall")) {
        const startTile = gameMap.getTileAtXY(x, y);
        const endTile = gameMap.getTileAtXY(tileX, tileY);
        tilesInALine = getDijkstraPath(
          gameMap.tiles,
          startTile,
          endTile
        ).path.concat([endTile]);
        if (!tilesInALine.length) {
          return console.log("No line available");
        }
      }
      tilesInALine.map((tile, index) => {
        const originalColor = tile.color;
        const color = 255 - index * 20;
        tile.color = `rgb(${color}, ${color}, ${color})`;
        setTimeout(() => (tile.color = originalColor), 1000);
      });
    }
  );
};

window.addEventListener(
  "resize",
  debounce(() => {
    renderGameObjects();
    Camera.resize();
  }, 100)
);

const render = () => {
  renderGameObjects();
  window.requestAnimationFrame(render);
};

const startTurn = () => {
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
  /*
  player.addMovementListener(
    "goldPath",
    debounce(showPathToClosestGold(gameMap), 100)
  );
  */
  player.addMovementListener(
    "visibilityTracker",
    gameMap.setVisibleTiles(gameObjects)
  );

  const originX = player.x;
  const originY = player.y;

  const addKeydownMovement = (e: any): void => {
    const mover: EntityType = getOrThrow(gameObjects.get("player"));

    triggerKeyAction(e.keyCode, mover);
    if (actionKeys.includes(e.keyCode)) {
      relocateIfPastBorder(mover);
      mover.attacking = true;

      gameObjects.set("player", mover);

      detectObjectCollision(gameObjects);
      updateOccupiedTiles(gameMap.tiles, gameObjects);

      if (checkIfPlayerHitWall(gameObjects.get("player"))) {
        const tempPlayer: EntityType = getOrThrow(gameObjects.get("player"));
        MessageBoard.log(
          `${tempPlayer.name} ran into a ${tempPlayer.collidingWith.type}`
        );
        tempPlayer.x = originX;
        tempPlayer.y = originY;
        tempPlayer.onMove();
        updateOccupiedTiles(gameMap.tiles, gameObjects);
        gameObjects.set("player", tempPlayer);
        tempPlayer.attacking = false;
        endTurn();
      } else if (gameObjects.get("player").collidingWith.type === "enemy") {
        const tempPlayer: EntityType = getOrThrow(gameObjects.get("player"));
        tempPlayer.x = originX;
        tempPlayer.y = originY;
        tempPlayer.onMove();
        tempPlayer.attacking = false;
        checkForDeath(gameObjects);
        updateOccupiedTiles(gameMap.tiles, gameObjects);
        gameObjects.set("player", tempPlayer);
        endTurn();
      } else {
        const tempPlayer: EntityType = getOrThrow(gameObjects.get("player"));
        tempPlayer.attacking = false;
        gameObjects.set("player", tempPlayer);
        endTurn();
      }
    }
  };

  document.addEventListener("keydown", addKeydownMovement);

  const endTurn = () => {
    document.removeEventListener("keydown", addKeydownMovement);
    const tempPlayer: EntityType = getOrThrow(gameObjects.get("player"));
    tempPlayer.onEndTurn();
    gameObjects.set("player", tempPlayer);
    enemyTurn(tempPlayer);
    doneColliding(tempPlayer);
    startTurn();
  };
};

const updateOccupiedTiles = (tiles, objects) => {
  tiles.map(tile => (tile.occupiedBy = []));
  const objArr = Array.from(objects.values());
  const occupiedTiles = tiles.filter(tile =>
    objArr.some(({ x, y }) => tile.x == x && tile.y == y)
  );
  if (occupiedTiles.length) {
    occupiedTiles.forEach(tile => {
      const occupant = getOrThrow(
        objArr.find(({ x, y }) => tile.x == x && tile.y == y)
      );
      const { id, type } = occupant;
      tile.occupiedBy = tile.occupiedBy.concat([{ id, type }]);
    });
  }
};

const enemyTurn = player => {
  const enemies = getEnemies(gameObjects);
  const originalPositions = enemies.map(({ id, x, y }) => {
    return {
      id,
      x,
      y,
    };
  });
  enemies.forEach(enemy => {
    enemy.onStartTurn(gameMap.tiles);
    enemy.attacking = true;
    gameObjects.set(enemy.id, enemy);
  });
  detectObjectCollision(gameObjects);
  enemies.filter(e => e.collidingWith.hasOwnProperty("id")).forEach(e => {
    const { x, y } = originalPositions.find(pos => pos.id == e.id);
    e.x = x;
    e.y = y;
    doneColliding(e);
    gameObjects.set(e.id, e);
    gameObjects.set("player", player);
  });
  enemies.forEach(enemy => {
    enemy.attacking = false;
    gameObjects.set(enemy.id, enemy);
  });
  checkForDeath(gameObjects);
  gameMap.setVisibleTiles(gameObjects)(player);
  updateOccupiedTiles(gameMap.tiles, gameObjects);
};

const getEnemies = objects => {
  return Array.from(objects.values()).filter(obj => obj.type === "enemy");
};

const detectObjectCollision = objects => {
  quadtree.clear();
  gameMap.wallTiles
    .concat(gameMap.triggerTiles)
    .forEach(tile => quadtree.insert(tile));
  for (const sprite of objects.values()) {
    quadtree.insert(sprite);
  }
  detectCollision(quadtree);
};

const checkForDeath = objects => {
  Array.from(objects.values()).forEach(sprite => {
    if (sprite.hp <= 0) {
      if (sprite.type !== "player") {
        MessageBoard.log(`${sprite.name} died!`);
        objects.delete(sprite.id);
      } else {
        console.log("Player died!");
      }
    }
  });
};
