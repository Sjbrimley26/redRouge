export const getTileCoords = (x, y) => {
  const tileX = Math.floor(x / 64) * 64;
  const tileY = Math.floor(y / 64) * 64;
  return [tileX, tileY];
};

export const getTileAtXY = (x, y) => tile => {
  return tile.x === x && tile.y === y;
};

export const getTileById = id => tile => {
  return tile.id === id;
};
