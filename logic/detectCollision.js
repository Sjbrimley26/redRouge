const detectCollision = async quadtree => {
  let objects = [];
  quadtree.getAllObjects(objects);

  for (let objX of objects) {
    let obj = [];
    quadtree.findObjects(obj, objX);

    for (let objY of obj) {
      if (objX.id === objY.id) {
        continue;
      }
      if (
        (objX.isCollidableWith(objY) || objY.isCollidableWith(objX)) &&
        (objX.x === objY.x && objX.y === objY.y)
      ) {
        let originalX = {
          ...objX,
        };
        let originalY = {
          ...objY,
        };
        objX.collidingWith = originalY;
        objY.collidingWith = originalX;
        objX.isColliding = true;
        objY.isColliding = true;
        objX.onCollide(originalY);
        objY.onCollide(originalX);
      }
    }
  }
};

export default detectCollision;
