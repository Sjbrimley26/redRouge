'use strict'

import { redTile } from "../objects/tiles"

import { TILE_SIZE } from "../objects/map/config";

const Player = () => {

  const player = {
    ...redTile,
    x: TILE_SIZE,
    y: TILE_SIZE,
    movementListeners: new Map(),

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

    addMovementListener(tag, fn) {
      this.movementListeners.set(tag, fn);
    },

    removeMovementListener(tag) {
      if (this.movementListeners.has(tag)) {
        this.movementListeners.delete(tag);
      }
    },

    onMove() {
      for ( let fn of this.movementListeners.values() ) {
        fn.call(null, this);
      }
    }
  };

  return player;
};

export default Player;