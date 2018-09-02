'use strict'

import "babel-polyfill";

import "../assets/styles/global.scss";

import { debounce } from "lodash";

import { 
  createTileMap,
  TILE_SIZE,
  MAP_HEIGHT,
  MAP_WIDTH
} from "../objects/map";

import { QuadTree, Player, Camera } from "../classes";

import { 
  getCanvas, 
  resizeCanvas,
  renderMultipleSprites,
} from "../canvas";

const gameMap = createTileMap();

const gameObjects = new Map();

const player = Player();
const camera = Camera();

player.addMovementListener("camera", player => {
  let x = player.x - ( camera.width / 2 );
  let y = player.y - ( camera.height / 2 );

  if ( x % 64 !== 0 ) {
    x = Math.floor(x / 64) * 64;
  }

  if ( y % 64 !== 0 ) {
    y = Math.floor(y / 64) * 64;
  }

  camera.relocate(x, y);

});

gameObjects.set("player", player);

const quadtree = QuadTree(0, { x:0, y:0, width: MAP_WIDTH, height: MAP_HEIGHT });


window.onload = () => {
  render();
  camera.resize();
  startTurn();
};

window.addEventListener("resize", debounce(() => {
  getCanvas("background")
    .then(resizeCanvas)
    .then(canvas => renderMultipleSprites(canvas, camera, gameMap.tiles))
    .then(canvas => renderMultipleSprites(canvas, camera, gameObjects))

  camera.resize();
  
}, 100));



const render = () => {

  getCanvas("background")
    .then(resizeCanvas)
    .then(canvas => renderMultipleSprites(canvas, camera, gameMap.tiles))
    .then(canvas => renderMultipleSprites(canvas, camera, gameObjects))

  window.requestAnimationFrame(render);
};

const detectCollision = async () => {
  let objects = [];
  quadtree.getAllObjects(objects);

  for (let objX of objects) {
    let obj = [];
    quadtree.findObjects(obj, objX);

    for (let objY of obj) {
      if (
        (
          objX.isCollidableWith(objY) ||
          objY.isCollidableWith(objX)
        ) &&
        (
          objX.x === objY.x &&
          objX.y === objY.y
        )
      ) {
        objX.isColliding = true;
        objY.isColliding = true;
        objX.collidingWith = {...objY};
        objY.collidingWith = {...objX};
      }
    }
  }

};

const startTurn = () => {
  const player = { ...gameObjects.get("player") };

  const originX = player.x;
  const originY = player.y;

  quadtree.clear();
  gameMap.tiles.forEach(tile => quadtree.insert(tile));

  const addKeydownMovement = e => {
    const mover = { ...gameObjects.get("player") };
    mover.isColliding = false;
    mover.collidingWith = undefined;
    mover.x = player.x < 0 ? 0 : player.x;
    mover.x = player.x > MAP_WIDTH - TILE_SIZE ? MAP_WIDTH - TILE_SIZE : player.x;
    mover.y = player.y < 0 ? 0 : player.y;
    mover.y > MAP_HEIGHT - TILE_SIZE ? MAP_HEIGHT - TILE_SIZE : player.y;

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

    gameObjects.set("player", mover);

    for (let sprite of gameObjects.values()) {
      quadtree.insert(sprite);
    }

    detectCollision();

    document.removeEventListener("keydown", addKeydownMovement);

    if (gameObjects.get("player").isColliding) {
      let tempPlayer = { ...gameObjects.get("player") };
      console.log(`You ran into a ${tempPlayer.collidingWith.type}`);
      tempPlayer.x = originX;
      tempPlayer.y = originY;
      gameObjects.set("player", tempPlayer);
      document.addEventListener("keydown", addKeydownMovement);
    }
  };

  const addEnterListener = e => {
    if (e.keyCode === 13) {
      document.removeEventListener("keydown", addKeydownMovement);
      document.removeEventListener("keydown", addEnterListener);
      endTurn();
    }
  }

  document.addEventListener("keydown", addEnterListener);

  document.addEventListener("keydown", addKeydownMovement);

  // Might need to move everything BUT the player, in lieu of a camera
  // Then when the player gets close to an edge, the camera stops
  // and the player begins moving

};

const endTurn = () => {
  startTurn();
}
