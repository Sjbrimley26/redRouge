export const getTileCoords = (x, y) => {
  const tileX = Math.floor(x / 64) * 64;
  const tileY = Math.floor(y / 64) * 64;
  return [tileX, tileY];
};
