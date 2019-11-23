import Vector2 from "./Vector2.js";
import { drawCircle } from "./graphics.js";

export default class Bezier {
  constructor({ points, drawConfig }) {
    this.drawConfig = Object.assign(
      {
        drawInputPoints: true,
        circleR: 10,
        startRandomX: 0,
        endRandomX: 500,
        startRandomY: 0,
        endRandomY: 500,
        colorPalette: [
          "#00a8ff",
          "#e84118",
          "#9c88ff",
          "#273c75",
          "#fbc531",
          "#4cd137",
          "#487eb0",
          "#0097e6",
          "#8c7ae6",
          ""
        ]
      },
      drawConfig
    );
    this.inputPoints =
      points ||
      new Array(4)
        .fill(0)
        .map(
          (_, i) =>
            new Point(
              new Vector2(
                Math.random() *
                  (this.drawConfig.endRandomX - this.drawConfig.startRandomX) +
                  this.drawConfig.startRandomX,
                Math.random() *
                  (this.drawConfig.endRandomY - this.drawConfig.startRandomY) +
                  this.drawConfig.startRandomY
              ),
              this.drawConfig.colorPalette[
                i % this.drawConfig.colorPalette.length
              ]
            )
        );
    this.layers = [];
  }

  draw(ctx) {
    if (this.drawConfig.drawInputPoints) {
      this.inputPoints.forEach(p => {
        drawCircle(ctx, p.x, p.y, this.drawConfig.circleR, p.color);
      });
    }
  }

  calcMidPoints(t) {
    do {
      if(this.layers.length == 0){
        
      }
    } while (this.layers[this.layers.length - 1] > 1);
  }

}
calcArrayMidPoints(arr, t){
  return new Array(arr.length - 1).fill(0).map(() => {
    
  })
}

export const getMidPoint = (a, b, t = 0.5) => {
  return new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
};

class Point {
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
}
