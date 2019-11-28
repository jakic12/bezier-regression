import Vector2 from "./Vector2.js";

export default class Point {
  constructor(posVector, color) {
    this.pos = posVector;
    this.color = color;
  }

  get x() {
    return this.pos.x;
  }
  set x(val) {
    this.pos.x = val;
  }

  get y() {
    return this.pos.y;
  }
  set y(val) {
    this.pos.y = val;
  }

  clone() {
    return new Point(new Vector2(this.pos.x, this.pos.y), this.color);
  }
}
