// @flow

export type CanvasType = {
  width: number,
  height: number,
};

export type CameraType = {
  x: number,
  y: number,
  xMax: number,
  yMax: number,
  width: number,
  height: number,
};

export type SpriteType = {
  size: number,
  x: number,
  y: number,
  color: string,
};

export type EntityType = {
  x: number,
  y: number,
  type: string,
  onStartTurn: void => void,
  isColliding: boolean,
  collidingWith: Object,
  onEndTurn: void => void,
  addMovementListener: (string, (any) => void) => void,
};

export type FloorTileType = {
  x: number,
  y: number,
  type: "ground" | "wall",
  onCollide: void => void,
};

export type EffectType = {
  name: string,
  type: string,
  strength: number,
  duration: number,
};
