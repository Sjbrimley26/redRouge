import { get2DContext } from "./general";

const resizeCanvas = async canvas => {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  return canvas;
};

const renderSprite = async (canvas, camera, sprite) => {
  let ctx = await get2DContext(canvas);

  if (
    sprite.x >= camera.x &&
    sprite.x <= camera.xMax * 2 &&
    sprite.y >= camera.y &&
    sprite.y <= camera.yMax * 2
  ) {
    let { size, x, y, color } = sprite;

    x -= camera.x;
    y -= camera.y;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }

  return canvas;
};

const renderMultipleSprites = async (canvas, camera, arrayOrMap) => {
  if (Array.isArray(arrayOrMap)) {
    for (let sprite of arrayOrMap) {
      renderSprite(canvas, camera, sprite);
    }
  } else {
    for (let sprite of arrayOrMap.values()) {
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

const zoomIn = async canvas => {
  let ctx = await get2DContext(canvas);
  ctx.scale(2, 2);
  return canvas;
};

const zoomOut = async canvas => {
  let ctx = await get2DContext(canvas);
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
