// @flow
import {
  collidable,
  viewable,
  moveable,
  turnBased,
  opaque,
  memorable,
} from "./prototypes";

import { get_new_id } from "../../utilities";
import { triggerStatusEffect } from "../statusEffects";
import { MessageBoard } from "../../classes";

const Entity = function({
  color,
  size,
  x,
  y,
  name,
  type,
  hp,
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
    moveable,
    turnBased,
    opaque,
    memorable,
    {
      x,
      y,
      hp,
      color,
      onCollide,
      normalColor: color,
      size,
      name,
      type,
      collidableWith: ["wall", "enemy", "trigger", "player", "gold"],
      gold: 0,
      movementListeners: new Map(),
      limitedMovementListeners: new Map(),
      id: get_new_id(),
      attacking: false,
    }
  );
};

const onCollide = function(collidable) {
  switch (collidable.type) {
    case "trigger":
    case "gold":
      triggerStatusEffect(this, collidable.effect);
      break;
    case "enemy":
    case "player":
      collidable.hp -= this.damage;
      MessageBoard.log(
        `${collidable.name} took ${this.damage} damge. 
        ${collidable.name} has ${collidable.hp} hp remaining.`
      );
      break;
  }
};

export default Entity;
