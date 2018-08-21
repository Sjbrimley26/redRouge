import { get2DContext } from "./general";

exports.resizeCanvas = async canvas => {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  return canvas;
};

exports.renderSprite = async ( canvas, sprite ) => {
  let ctx = await get2DContext(canvas)
  
  const {
    size,
    x,
    y,
    color
  } = sprite;

  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);

  return canvas;
}