import { resizeCanvas } from "../canvas";

import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "../objects/map";

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

    relocate(x, y) {
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

    setZoom(level) {
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
  };

  return camera;
};

export default Camera;
