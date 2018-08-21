import "babel-polyfill";

import "../assets/styles/global.scss";

import { debounce } from "lodash";

import { redTile } from "../objects/tiles";
import { createTileMap } from "../objects/map";

import { QuadTree } from "../classes";

import { 
  getCanvas, 
  resizeCanvas, 
  renderSprite,
  get2DContext
} from "../canvas";

const MAP_HEIGHT = 1440;
const MAP_WIDTH = 2560;
const TILE_SIZE = 64;

const map = createTileMap(MAP_WIDTH, MAP_HEIGHT);

const gameObjects = new Map();

gameObjects.set("player", { 
  ...redTile, 
  x: TILE_SIZE, 
  y: TILE_SIZE, 
  speed: 5
});

const quadtree = QuadTree(0, { x:0, y:0, width: MAP_WIDTH, height: MAP_HEIGHT });


let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;

document.addEventListener("keydown", function (e) {
  switch (e.keyCode) {
    case 37:
    case 65:
      leftPressed = true;
      break;

    case 38:
    case 87:
      upPressed = true;
      break;

    case 39:
    case 68:
      rightPressed = true;
      break;

    case 40:
    case 83:
      downPressed = true;
      break;
  }
}, false);

document.addEventListener("keyup", function (e) {
  switch (e.keyCode) {
    case 37:
    case 65:
      leftPressed = false;
      break;

    case 38:
    case 87:
      upPressed = false;
      break;

    case 39:
    case 68:
      rightPressed = false;
      break;

    case 40:
    case 83:
      downPressed = false;
      break;
  }
}, false);



window.onload = () => {

  getCanvas("background")
    .then(canvas => {
      return resizeCanvas(canvas);
    })
    .then(canvas => {
      map.forEach(tile => {
        // console.log(tile);
        renderSprite(canvas, tile);
      });
      return Promise.resolve(canvas);
    })
    .then(canvas => {
      for (let sprite of gameObjects.values()) {
        if (sprite.x < canvas.width && sprite.y < canvas.height) {
          renderSprite(canvas, sprite);
        }
      }
      return Promise.resolve(canvas);
    })    

  window.requestAnimationFrame(render);

};

window.addEventListener("resize", debounce(() => {

  getCanvas("background")
    .then(resizeCanvas)
    .then(async canvas => {
      map.forEach(tile => renderSprite(canvas, tile));
      return canvas;
    })
    .then(async canvas => {
      for (let sprite of gameObjects.values()) {
        if (sprite.x < canvas.width && sprite.y < canvas.height) {
          renderSprite(canvas, sprite);
        }
      }
      return canvas;
    })   

}, 100));



const render = () => {
  let player = gameObjects.get("player");
  let { speed } = player;

  let originX = player.x;
  let originY = player.y;

  switch(true) {
    case (upPressed && rightPressed):
      player.y -= Math.ceil(Math.sqrt(Math.pow(speed, 2) * 2) / 2);
      player.x += Math.ceil(Math.sqrt(Math.pow(speed, 2) * 2) / 2);
      break;
    
    case (upPressed && leftPressed):
      player.x -= Math.ceil(Math.sqrt(Math.pow(speed, 2) * 2) / 2);
      player.y -= Math.ceil(Math.sqrt(Math.pow(speed, 2) * 2) / 2);
      break;
    
    case (downPressed && rightPressed):
      player.y += Math.ceil(Math.sqrt(Math.pow(speed, 2) * 2) / 2);
      player.x += Math.ceil(Math.sqrt(Math.pow(speed, 2) * 2) / 2);
      break;

    case (downPressed && leftPressed):
      player.x -= Math.ceil(Math.sqrt(Math.pow(speed, 2) * 2) / 2);
      player.y += Math.ceil(Math.sqrt(Math.pow(speed, 2) * 2) / 2);
      break;

    case (upPressed):
      player.y -= speed;
      break;
    
    case (downPressed):
      player.y += speed;
      break;
    
    case (leftPressed):
      player.x -= speed;
      break;
    
    case (rightPressed):
      player.x += speed;
      break;
    
  }
  
  player.isColliding = false;
  player.collidingWith = undefined;
  player.x = player.x < 0 ? 0 : player.x;
  player.x = player.x > MAP_WIDTH - TILE_SIZE ? MAP_WIDTH - TILE_SIZE : player.x;
  player.y = player.y < 0 ? 0 : player.y;
  player.y > MAP_HEIGHT - TILE_SIZE ? MAP_HEIGHT - TILE_SIZE : player.y;
  gameObjects.set("player", player);

  quadtree.clear();
  map.forEach(tile => quadtree.insert(tile));
  for (let sprite of gameObjects.values()) {
    quadtree.insert(sprite);
  }

  detectCollision();
  
  if (gameObjects.get("player").isColliding) {
    relocatePlayer(originX, originY);
  }
  // Might need to move everything BUT the player, in lieu of a camera
  // Then when the player gets close to an edge, the camera stops
  // and the player begins moving

  // I'll also split the foreground and backgrouond,
  // but I need to split the tiles into walkable and non-walkable

  getCanvas("background")
    .then(canvas => resizeCanvas(canvas))
    .then(canvas => {
      map.forEach(tile => renderSprite(canvas, tile));
      return Promise.resolve(canvas);
    })
    .then(canvas => {
      for (let sprite of gameObjects.values()) {
        if (sprite.x < canvas.width && sprite.y < canvas.height) {
          renderSprite(canvas, sprite);
        }
      }
      return Promise.resolve(canvas);
    })

  window.requestAnimationFrame(render);
};

const detectCollision = () => {
  let objects = [];
  quadtree.getAllObjects(objects);

  for (let objX of objects) {
    let obj = [];
    quadtree.findObjects(obj, objX);

    for (let objY of obj) {

      if (objX.isCollidableWith(objY) &&
        (
          objX.x < objY.x + objY.width &&
          objX.x + objY.width > objY.x &&
          objX.y < objY.y + objY.height &&
          objX.y + objX.height > objY.y
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

const relocatePlayer = (originX, originY) => {
  let tempPlayer = gameObjects.get("player");
  console.log("Relocate", tempPlayer)
  if (!tempPlayer.collidingWith) return;

  let startX = tempPlayer.collidingWith.x;
  let endX = startX + tempPlayer.collidingWith.width;
  let startY = tempPlayer.collidingWith.y;
  let endY = startY + tempPlayer.collidingWith.height;

  let vectorSlope = 0;
  let slopeType;
  let slopeSign;
  let vectorZone;
  let testPoints = [];

  if (tempPlayer.y - originY === 0) slopeType = "horizontal";
  else if (tempPlayer.x - originX === 0) slopeType = "vertical";
  else vectorSlope = (tempPlayer.y - originY) / (tempPlayer.x - originX);

  if ( slopeType === "horizontal" ) {
    if (tempPlayer.x > startX && tempPlayer.x < endX) {
      slopeSign = "positive";
      testPoints.push(
        { x: originX + 64, y: originY },
        { x: originX + 64, y: originY + 64 }
      );
    } else {
      slopeSign = "negative";
      testPoints.push(
        { x: originX, y: originY },
        { x: originX, y: originY + 64 }
      );
    }
  }

  else if ( slopeType === "vertical" ) {
    if (tempPlayer.y > endY && tempPlayer.y < startY) {
      slopeSign = "positive";
      testPoints.push(
        { x: originX, y: originY },
        { x: originX + 64, y: originY }
      );
    } else {
      slopeSign = "negative";
      testPoints.push(
        { x: origin, y: originY + 64 },
        { x: originX + 64, y: originY + 64 }
      );
    }
  }

  else if ( vectorSlope > 0 ) {
    slopeSign = "positive";
    if (originY < endY) {
      vectorZone = 1;
      testPoints.push(
        { x: originX, y: originY },
        { x: originX + 64, y: originY },
        { x: originX + 64, y: originY + 64 }
      );
    } 
    else { 
      vectorZone = 3;
      testPoints.push(
        { x: originX, y: originY },
        { x: originX, y: originY + 64 },
        { x: originX + 64, y: originY + 64 }
      );
    }
  }

  else {
    slopeSign = "negative";
    if (originY < endY) {
      vectorZone = 4;
      testPoints.push(
        { x: originX, y: originY },
        { x: originX, y: originY + 64 },
        { x: originX, y: originY + 64 }
      );
    } else {
      vectorZone = 2;
      testPoints.push(
        { x: originX + 64, y: originY },
        { x: originX, y: originY + 64 },
        { x: originX + 64, y: originY + 64 }
      );
    }
  }

  let dx1 = Math.abs(originX - startX);
  let dx2 = Math.abs(originX - endX);
  let dy1 = Math.abs(originY - startY);
  let dy2 = Math.abs(originY - endY);
  let distances = [dx1, dx2, dy1, dy2];

  if ([dx1, dx2].includes(_.min(distances))) {
    console.log("Horizontal collision!")
    tempPlayer.y = dy1 < dy2 ? startY - 64 : endY;
  } else {
    console.log("Vertical collision!")
    tempPlayer.x = dx1 < dx2 ? startX - 64 : endX;
  }

  gameObjects.set("player", tempPlayer);
};

const distanceFormula = (x1, y1, x2, y2) => {
  return Math.sqrt(
    Math.pow((x2 - x1), 2) -
    Math.pow((y2 - y1), 2)
  );
};
