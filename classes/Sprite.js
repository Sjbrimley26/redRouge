const Sprite = function({
  size,
  x,
  y,
  color,
  collidableWith = [],
  type,
  isOpaque,
}) {
  this.size = size;
  this.height = size;
  this.width = size;
  this.x = x;
  this.y = y;
  this.color = color;
  this.collidableWith = collidableWith;
  this.type = type;
  this.collidingWith = {};
  this.isOpaque = isOpaque ? isOpaque : false;
};

Sprite.prototype.isCollidableWith = function(object) {
  return this.collidableWith.some(type => type === object.type);
};

Sprite.prototype.onCollide = function() {};

Sprite.prototype.type = "sprite";

Sprite.prototype.isOpaque = false;

Sprite.prototype.isColliding = false;

Sprite.prototype.getClone = function() {
  return Object.create(this);
};

export default Sprite;
