// @flow
import {
  collidable,
  viewable,
  triggersTiles,
  moveable,
  turnBased,
  hasId,
  opaque,
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
    {
      x,
      y,
      color,
      size,
      name,
      type,
      collidableWith: ["wall", "enemy", "trigger", "player"],
    }
  );
};

export default Entity;
