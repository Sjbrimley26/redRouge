// @flow

import { triggerStatusEffect } from "../statusEffects";
import { TILE_SIZE } from "../map/config";
import sample from "lodash/sample";
import MessageBoard from "../../classes/MessageBoard";
import type { FloorTileType } from "../../flowTypes";

const getMap = () => {
  const map: Map<string, any> = new Map();
  return map;
};

export const clonable = {
  getClone() {
    return Object.create(this);
  },
};

export const collidable = {
  isCollidableWith(object: any) {
    return this.collidableWith.some(type => type === object.type);
  },

  onCollide() {},

  isColliding: false,

  collidingWith: {},
};

export const viewable = {
  visible: false,
  isOpaque: false,
};

// has to be added after collidable
export const triggersTiles = {
  onCollide(tile: FloorTileType) {
    if (tile.effect) {
      triggerStatusEffect(this, tile.effect);
    }
  },
};

export const moveable = {
  movementListeners: getMap(),
  limitedMovementListeners: getMap(),

  moveUp() {
    this.y -= TILE_SIZE;
    return this;
  },

  moveDown() {
    this.y += TILE_SIZE;
    return this;
  },

  moveRight() {
    this.x += TILE_SIZE;
    return this;
  },

  moveLeft() {
    this.x -= TILE_SIZE;
    return this;
  },

  addMovementListener(tag: string, fn: any, turnLimit: number = 0) {
    if (this.movementListeners.has(tag)) {
      if (this.limitedMovementListeners.has(tag)) {
        // So the duration of the original effect is extended,
        // rather than making a new tag.
        // I might want to make it so that it does the stronger of
        // the two effects, or maybe some way of stacking the effects.
        const originalValue = this.limitedMovementListeners.get(tag);
        this.limitedMovementListeners.set(tag, originalValue + turnLimit);
      }
      return;
    }
    this.movementListeners.set(tag, fn);
    if (turnLimit) {
      this.limitedMovementListeners.set(tag, turnLimit);
    }
  },

  removeMovementListener(tag: string) {
    if (this.movementListeners.has(tag)) {
      this.movementListeners.delete(tag);
    }
  },

  onMove() {
    for (const fn of this.movementListeners.values()) {
      fn.call(null, this);
    }

    for (const tag of this.movementListeners.keys()) {
      if (this.limitedMovementListeners.has(tag)) {
        const originalValue = this.limitedMovementListeners.get(tag);

        if (originalValue > 1) {
          this.limitedMovementListeners.set(tag, originalValue - 1);
        } else {
          const messages = [
            `${this.name} is no longer affected by the ${tag}.`,
            `The ${tag} has worn off.`,
            `It seems that the ${tag} effect stopped.`,
          ];
          MessageBoard.log(sample(messages));
          this.limitedMovementListeners.delete(tag);
          this.movementListeners.delete(tag);
        }
      }
    }
  },
};

export const turnBased = {
  onStartTurn() {},
  onEndTurn() {},
};

export const opaque = {
  isOpaque: true,
};

export const memorable = {
  seen: false,
};
