import { redTile } from "../objects/tiles";
import { TILE_SIZE } from "../objects/map/config";
import sample from "lodash/sample";

const Player = () => {
  const player = {
    ...redTile,
    x: TILE_SIZE,
    y: TILE_SIZE,
    movementListeners: new Map(),
    limitedMovementListeners: new Map(),

    type: "player",
    collidableWith: ["wall", "enemy", "trigger"],

    onCollide(tile) {
      if (tile.effect) {
        switch (tile.effect.type) {
          case "poison":
            console.log("You step on a poisonous mushroom!");
            this.addMovementListener(
              "poison",
              () => {
                console.log("You are poisoned!");
              },
              tile.effect.duration,
            );
            break;
        }
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
              `You are no longer affected by the ${tag}.`,
              `The ${tag} has worn off.`,
              `It seems that ${tag} stopped.`,
            ];
            console.log(sample(messages));
            this.limitedMovementListeners.delete(tag);
            this.movementListeners.delete(tag);
          }
        }
      }
    },
  };

  return player;
};

export default Player;
