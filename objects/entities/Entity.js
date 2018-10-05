// @flow
import {
  collidable,
  viewable,
  triggersTiles,
  moveable,
  turnBased,
  hasId,
  opaque,
  memorable,
} from "./prototypes";

const Entity = function({
  color,
  size,
  x,
  y,
  name,
  type,
}: {
  color: string,
  size: number,
  x: number,
  y: number,
  name: string,
  type: string,
}) {
  return Object.assign(
    {},
    collidable,
    viewable,
    triggersTiles,
    moveable,
    turnBased,
    hasId,
    opaque,
    memorable,
    {
      x,
      y,
      color,
      normalColor: color,
      size,
      name,
      type,
      collidableWith: ["wall", "enemy", "trigger", "player"],
      gold: 0,
    }
  );
};

export default Entity;
