// @flow

import { redTile } from "../objects/tiles";
import { TILE_SIZE } from "../objects/map/config";
import sample from "lodash/sample";
import { triggerStatusEffect } from "../objects/statusEffects";
import { get_new_id } from "../utilities";

const Entity = ({
  x,
  y,
  name,
  type,
}: {
  x: number,
  y: number,
  name: string,
  type: string,
}) => {
  const entity = {
    ...redTile,
    x,
    y,
    type,
    name,
    id: get_new_id(),
    movementListeners: new Map(),
    limitedMovementListeners: new Map(),
    collidableWith: ["wall", "enemy", "trigger", "player"],
    visibility: "hidden",
    isOpaque: true,

    onCollide(tile) {
      if (tile.effect) {
        triggerStatusEffect(this, tile.effect);
      }
    },

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

    addMovementListener(tag, fn, turnLimit = 0) {
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
    },

    removeMovementListener(tag) {
      if (this.movementListeners.has(tag)) {
        this.movementListeners.delete(tag);
      }
    },

    onMove() {
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
    },

    onStartTurn() {},

    onEndTurn() {},
  };

  return entity;
};

export default Entity;
