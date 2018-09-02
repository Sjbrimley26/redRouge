import { get2DContext } from "./general";

const resizeCanvas = async canvas => {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  return canvas;
};

const renderSprite = async ( canvas, camera, sprite ) => {
  let ctx = await get2DContext(canvas)
  
  if ( 
    sprite.x >= camera.x && 
    sprite.x <= camera.xMax &&
    sprite.y >= camera.y &&
    sprite.y <= camera.yMax
  ) { 

    let {
      size,
      x,
      y,
      color
    } = sprite;

    x -= camera.x;
    y -= camera.y;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }

  return canvas;
};

const renderMultipleSprites = async ( canvas, camera, arrayOrMap ) => {
  if (Array.isArray(arrayOrMap)) {
    for ( let sprite of arrayOrMap ) {
      renderSprite(canvas, camera, sprite);
    }
  } else {
    for (let sprite of arrayOrMap.values()) {
      renderSprite(canvas, camera, sprite);
    }
  }

  return canvas;
};

module.exports = {
  resizeCanvas,
  renderMultipleSprites,
  renderSprite
}