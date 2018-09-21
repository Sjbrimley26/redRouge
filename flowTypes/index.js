// @flow

export type CanvasType = {
  width: number,
  height: number,
};

export type ZoomLevels = "normal" | "zoomIn" | "zoomOut";

export type CameraType = {
  x: number,
  y: number,
  xMax: number,
  yMax: number,
  width: number,
  height: number,
  trackPlayer: EntityType => CameraType | void,
  resize: void => void,
  setZoom: ZoomLevels => void,
};

export type SpriteType = {
  size: number,
  x: number,
  y: number,
  color: string,
  visibility: "hidden" | "visible",
};

export type EntityType = {
  x: number,
  y: number,
  type: string,
  onStartTurn: void => void,
  isColliding: boolean,
  collidingWith: Object,
  onEndTurn: void => void,
  addMovementListener: (string, (any) => any) => void,
  sightRadius: number,
  onMove: void => void,
};

export type FloorTileType = {
  x: number,
  y: number,
  type: "ground" | "wall",
  onCollide: void => void,
  color: string,
  visibility: "hidden" | "visible",
  isOpaque: boolean,
};

export type EffectType = {
  name: string,
  type: string,
  strength: number,
  duration: number,
};
