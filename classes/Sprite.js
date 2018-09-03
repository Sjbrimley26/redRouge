const Sprite = ({ size, x, y, color }) => {
  let sprite = {
    size,
    height: size,
    width: size,
    x,
    y,
    color,
    collidableWith: [],
    collidingWith: {},
    isColliding: false,
    type: "",

    onCollide() {},

    isCollidableWith(object) {
      return this.collidableWith.some(type => type === object.type);
    },
  };

  return sprite;
};

export default Sprite;
