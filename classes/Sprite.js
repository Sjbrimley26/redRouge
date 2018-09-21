const Sprite = function({
  size,
  x,
  y,
  color,
  type = "sprite",
  collidableWith = [],
  isOpaque = false,
}) {
  return Object.assign(Object.create(spriteProto), {
    x,
    y,
    type,
    color,
    size,
    height: size,
    width: size,
    collidableWith,
    isOpaque,
  });
};

const spriteProto = {
  isCollidableWith(object) {
    return this.collidableWith.some(type => type === object.type);
  },

  onCollide() {},

  isColliding: false,

  getClone() {
    return Object.create(this);
  },

  collidingWith: {},
};

export default Sprite;
