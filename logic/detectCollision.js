const detectCollision = async quadtree => {
  const objects = [];
  quadtree.getAllObjects(objects);

  for (const objX of objects) {
    const obj = [];
    quadtree.findObjects(obj, objX);

    for (const objY of obj) {
      if (objX.id === objY.id) {
        continue;
      }
      if (
        (objX.isCollidableWith(objY) || objY.isCollidableWith(objX)) &&
        (objX.x === objY.x && objX.y === objY.y)
      ) {
        const originalX = { ...objX };
        const originalY = { ...objY };
        objX.collidingWith = objY;
        objY.collidingWith = objX;
        objX.isColliding = true;
        objY.isColliding = true;
        if (
          objX.hasOwnProperty("attacking") &&
          objY.hasOwnProperty("attacking")
        ) {
          if (objX.attacking) {
            objX.onCollide(objY);
          }
        } else {
          objX.onCollide(originalY);
          objY.onCollide(originalX);
        }
      }
    }
  }
};

export default detectCollision;
