// @flow

import { get2DContext } from "./general";

import type { CanvasType, CameraType, SpriteType } from "../flowTypes";

const resizeCanvas = async (canvas: CanvasType) => {
  if (document.body != null) {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
  }
  return canvas;
};

const renderSprite = async (
  canvas: CanvasType,
  camera: CameraType,
  sprite: SpriteType
) => {
  const ctx = await get2DContext(canvas);

  if (
    sprite.x >= camera.x &&
    sprite.x <= camera.xMax * 2 &&
    sprite.y >= camera.y &&
    sprite.y <= camera.yMax * 2
  ) {
    let { x, y, color } = sprite;
    const { size, seen, visible } = sprite;

    x -= camera.x;
    y -= camera.y;

    if (!visible && !seen) {
      color = "rgb(0, 0, 0)";
    } else if (!visible && seen) {
      const numString = color.slice(4, color.length - 1);
      const nums = numString
        .split(",")
        .map(item => parseFloat(item))
        .map(number => {
          return number - 60 >= 0 ? number - 60 : 0;
        });
      color = "rgb(" + nums.join(",") + ")";
    }

    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }

  return canvas;
};

const renderMultipleSprites = async (
  canvas: CanvasType,
  camera: CameraType,
  arrayOrMap: any
) => {
  if (Array.isArray(arrayOrMap)) {
    for (const sprite of arrayOrMap) {
      renderSprite(canvas, camera, sprite);
    }
  } else {
    for (const sprite of arrayOrMap.values()) {
      renderSprite(canvas, camera, sprite);
    }
  }

  return canvas;
};

// These work, but I need to adjust the camera to show more or less objects
// depending on whether the view is zoomed in or out

// Update: Got it working but the camera is still a bit funky when zoomed out.
// It works fine until you start moving the camera down and then a large
// bblank, black spoce appears.

const zoomIn = async (canvas: CanvasType) => {
  const ctx = await get2DContext(canvas);
  ctx.scale(2, 2);
  return canvas;
};

const zoomOut = async (canvas: CanvasType) => {
  const ctx = await get2DContext(canvas);
  ctx.scale(0.5, 0.5);
  return canvas;
};

module.exports = {
  resizeCanvas,
  renderMultipleSprites,
  renderSprite,
  zoomIn,
  zoomOut,
};
