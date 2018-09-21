// @flow

import { TILE_SIZE } from "../objects/map/config";
import sample from "lodash/sample";
import { triggerStatusEffect } from "../objects/statusEffects";
import { get_new_id } from "../utilities";

const Entity = function(
  sprite,
  x,
  y,
  name,
  type,
  id = get_new_id(),
  movementListeners: any = new Map(),
  limitedMovementListeners: any = new Map()
) {
  this.movementListeners = movementListeners;
  this.limitedMovementListeners = limitedMovementListeners;
  this.x = x;
  this.y = y;
  this.id = id;
  this.size = sprite.size;
  this.color = sprite.color;
};

Entity.prototype.collidableWith = ["wall", "enemy", "trigger", "player"];

Entity.prototype.visibility = "hidden";

Entity.prototype.isOpaque = true;

Entity.prototype.onCollide = function(tile) {
  if (tile.effect) {
    triggerStatusEffect(this, tile.effect);
  }
};

Entity.prototype.moveUp = function() {
  this.y -= TILE_SIZE;
  return this;
};

Entity.prototype.moveDown = function() {
  this.y += TILE_SIZE;
  return this;
};

Entity.prototype.moveRight = function() {
  this.x += TILE_SIZE;
  return this;
};

Entity.prototype.moveLeft = function() {
  this.x -= TILE_SIZE;
  return this;
};

Entity.prototype.addMovementListener = function(tag, fn, turnLimit = 0) {
  if (this.movementListeners.has(tag)) {
    if (this.limitedMovementListeners.has(tag)) {
      // So the duration of the original effect is extended,
      // rather than making a new tag.
      // I might want to make it so that it does the stronger of
      // the two effects, or maybe some way of stacking the effects.
      let originalValue = this.limitedMovementListeners.get(tag);
      this.limitedMovementListeners.set(tag, originalValue + turnLimit);
    }
    return;
  }
  this.movementListeners.set(tag, fn);
  if (turnLimit) {
    this.limitedMovementListeners.set(tag, turnLimit);
  }
};

Entity.prototype.removeMovementListener = function(tag) {
  if (this.movementListeners.has(tag)) {
    this.movementListeners.delete(tag);
  }
};

Entity.prototype.onMove = function() {
  for (let fn of this.movementListeners.values()) {
    fn.call(null, this);
  }

  for (let tag of this.movementListeners.keys()) {
    if (this.limitedMovementListeners.has(tag)) {
      let originalValue = this.limitedMovementListeners.get(tag);

      if (originalValue > 1) {
        this.limitedMovementListeners.set(tag, originalValue - 1);
      } else {
        const messages = [
          `${this.name} is no longer affected by the ${tag}.`,
          `The ${tag} has worn off.`,
          `It seems that the ${tag} effect stopped.`,
        ];
        console.log(sample(messages));
        this.limitedMovementListeners.delete(tag);
        this.movementListeners.delete(tag);
      }
    }
  }
};

Entity.prototype.onStartTurn = function() {};

Entity.prototype.onEndTurn = function() {};

Entity.prototype.isCollidableWith = function(obj) {
  return this.collidableWith.some(type => type === obj.type);
};

export default Entity;
