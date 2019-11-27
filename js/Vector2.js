export default class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  addNonMutative(vector) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }

  subtractNonMutative(vector) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }

  subtract(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  magnitude() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }
}
