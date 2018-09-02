import { resizeCanvas } from "../canvas";

import { MAP_HEIGHT, MAP_WIDTH } from "../objects/map";

const Camera = () =>  {
  const camera = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    xMax: 0,
    yMax: 0,

    relocate(x, y) {

      this.x = x;
      this.y = y;

      if (this.x  > MAP_WIDTH - this.width) {
        this.x = MAP_WIDTH - this.width;
      } else if ( this.x < 0 ) {
        this.x = 0;
      }

      if (this.y > MAP_HEIGHT - this.height) {
        this.y = MAP_HEIGHT - this.height;
      } else if ( this.y < 0 ) {
        this.y = 0;
      }

      this.setMaxes();
    },

    resize() {
      resizeCanvas(this);
      this.setMaxes();
    },

    setMaxes() {
      this.xMax = this.x + this.width;
      this.yMax = this.y + this.height;
    }


  };

  return camera;
};

export default Camera;