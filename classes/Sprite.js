const Sprite = ({
  size,
  x,
  y,
  color
}) => {
  
  let sprite = {
    size,
    height: size,
    width: size,
    x,
    y,
    color,
    collidableWith: [],
    isColliding: false,
    collidingWith: {},
    collisionType: "",
    type: "",

    isCollidableWith(object) {
      return this.collidableWith.some(type => type === object.type);
    }
  };

  return sprite;
};

export default Sprite;
