// @flow

import { resizeCanvas } from "../canvas";
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "../objects/map";
import type { EntityType } from "../flowTypes";

type ZoomLevels = "normal" | "zoomIn" | "zoomOut";

const Camera = () => {
  const camera = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    xMax: 0,
    yMax: 0,
    zoom: "normal",
    zoomFactor: 1,

    relocate(x: number, y: number) {
      let inverseFactor = 1;

      if (this.zoomFactor === 2) {
        inverseFactor = 0.5;
      }

      if (this.zoomFactor === 0.5) {
        inverseFactor = 2;
      }

      this.x = x;
      this.y = y;

      if (this.x > MAP_WIDTH - this.width * inverseFactor) {
        this.x = MAP_WIDTH - this.width * inverseFactor;
      } else if (this.x < 0) {
        this.x = 0;
      }

      if (this.y > MAP_HEIGHT - this.height * inverseFactor) {
        this.y = MAP_HEIGHT - this.height * inverseFactor;
      } else if (this.y < 0) {
        this.y = 0;
      }

      this.setMaxes();
    },

    async resize() {
      await resizeCanvas(this);
      this.width = Math.floor(this.width / TILE_SIZE) * TILE_SIZE;
      this.height = Math.floor(this.height / TILE_SIZE) * TILE_SIZE;
      this.setMaxes();
    },

    setMaxes() {
      this.xMax = this.x + this.width;
      this.yMax = this.y + this.height;
    },

    setZoom(level: ZoomLevels) {
      this.zoom = level;

      switch (level) {
        case "zoomIn":
          this.zoomFactor = 2;
          break;

        case "zoomOut":
          this.zoomFactor = 0.5;
          break;

        default:
          this.zoomFactor = 1;
          break;
      }
    },

    trackPlayer(player: EntityType) {
      // This one doesn't use 'this' because the context
      // gets messed up when used with the player.addMovementListener function
      let x = player.x - camera.width / (2 * camera.zoomFactor);
      let y = player.y - camera.height / (2 * camera.zoomFactor);

      if (x % TILE_SIZE !== 0) {
        x = Math.floor(x / TILE_SIZE) * TILE_SIZE;
      }

      if (y % TILE_SIZE !== 0) {
        y = Math.floor(y / TILE_SIZE) * TILE_SIZE;
      }

      camera.relocate(x, y);
    },
  };

  return camera;
};

export default Camera;
