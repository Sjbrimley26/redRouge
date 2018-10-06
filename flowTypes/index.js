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
  resize: void => Promise<CameraType>,
  setZoom: ZoomLevels => void,
};

export type SpriteType = {
  size: number,
  x: number,
  y: number,
  color: string,
  visible: boolean,
  seen: boolean | void,
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
  removeMovementListener: string => void,
  sightRadius: number,
  onMove: void => void,
  color: string,
  normalColor: string,
  seen: boolean,
  visible: boolean,
  hp: number,
  damage: number,
  attacking: boolean,
};

export type FloorTileType = {
  x: number,
  y: number,
  type: "ground" | "wall" | "trigger",
  onCollide: void => void,
  color: string,
  visible: boolean,
  isOpaque: boolean,
  getClone: void => FloorTileType,
  seen: boolean,
  addEffect: (string, EffectType) => void,
  effect: EffectType | void,
  id: string,
  neighbors: any | void,
  occupiedBy: Array<?string>,
};

export type EffectType = {
  name: string,
  type: string,
  strength: number,
  duration: number | void,
};
