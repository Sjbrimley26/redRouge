const QuadTree = (
  level = 0,
  bounds = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
) => {
  const MAX_OBJECTS = 10;
  const MAX_LEVELS = 5;

  let objects = [];

  return {
    bounds,
    nodes: [],

    clear() {
      objects = [];
      for (let node of this.nodes) {
        node.clear();
      }
      this.nodes = [];
    },

    /*
     * Return all objects that the object could collide with
     */

    getAllObjects(returnedObjects) {
      for (let node of this.nodes) {
        node.getAllObjects(returnedObjects);
      }
      for (let obj of objects) {
        returnedObjects.push(obj);
      }
      return returnedObjects;
    },

    findObjects(returnedObjects, obj) {
      if (typeof obj === "undefined") {
        console.log("UNDEFINED OBJECT");
        return;
      }
      let index = this.getIndex(obj);
      if (index != -1 && this.nodes.length) {
        this.nodes[index].findObjects(returnedObjects, obj);
      }
      for (let obj of objects) {
        returnedObjects.push(obj);
      }
      return returnedObjects;
    },

    /*
     * Insert the object into the quadTree. If the tree
     * excedes the capacity, it will split and add all
     * objects to their corresponding nodes.
     */

    insert(obj) {
      if (typeof obj === "undefined") {
        return;
      }
      if (obj instanceof Array) {
        for (let i of obj) {
          this.insert(i);
        }
        return;
      }
      if (this.nodes.length) {
        let index = this.getIndex(obj);
        // Only add the object to a subnode if it can fit completely
        // within one
        if (index != -1) {
          this.nodes[index].insert(obj);
          return;
        }
      }
      objects.push(obj);
      // Prevent infinite splitting
      if (objects.length > MAX_OBJECTS && level < MAX_LEVELS) {
        if (this.nodes[0] == null) {
          this.split();
        }
        let i = 0;
        while (i < objects.length) {
          let index = this.getIndex(objects[i]);
          if (index != -1) {
            this.nodes[index].insert(objects.splice(i, 1)[0]);
          } else {
            i++;
          }
        }
      }
    },

    /*
    * Determine which node the object belongs to. -1 means
    * object cannot completely fit within a node and is part
    * of the current node
	 */

    getIndex(obj) {
      let index = -1;
      let verticalMidpoint = this.bounds.x + this.bounds.width / 2;
      let horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
      // Object can fit completely within the top quadrant
      let topQuadrant =
        obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint;
      // Object can fit completely within the bottom quandrant
      let bottomQuadrant = obj.y > horizontalMidpoint;
      // Object can fit completely within the left quadrants
      if (obj.x < verticalMidpoint && obj.x + obj.width < verticalMidpoint) {
        if (topQuadrant) {
          index = 1;
        } else if (bottomQuadrant) {
          index = 2;
        }
      }
      // Object can fix completely within the right quandrants
      else if (obj.x > verticalMidpoint) {
        if (topQuadrant) {
          index = 0;
        } else if (bottomQuadrant) {
          index = 3;
        }
      }
      return index;
    },

    /*
     * Splits the node into 4 subnodes
     */

    split() {
      // Bitwise or [html5rocks]
      let subWidth = this.bounds.width / 2;
      let subHeight = this.bounds.height / 2;

      this.nodes[0] = QuadTree(
        0,
        {
          x: this.bounds.x + subWidth,
          y: this.bounds.y,
          width: subWidth,
          height: subHeight,
        },
        level + 1,
      );

      this.nodes[1] = QuadTree(
        0,
        {
          x: this.bounds.x,
          y: this.bounds.y,
          width: subWidth,
          height: subHeight,
        },
        level + 1,
      );

      this.nodes[2] = QuadTree(
        0,
        {
          x: this.bounds.x,
          y: this.bounds.y + subHeight,
          width: subWidth,
          height: subHeight,
        },
        level + 1,
      );

      this.nodes[3] = QuadTree(
        0,
        {
          x: this.bounds.x + subWidth,
          y: this.bounds.y + subHeight,
          width: subWidth,
          height: subHeight,
        },
        level + 1,
      );
    },
  };
};

export default QuadTree;
