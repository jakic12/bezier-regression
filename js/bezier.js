import Vector2 from "./Vector2.js";
import { drawCircle, drawLineWithMultiplePoints } from "./graphics.js";

export default class Bezier {
  constructor({ points, drawConfig }) {
    this.drawConfig = Object.assign(
      {
        startDisplayTime: 0.5,
        drawBezierLine: true,
        bezierDt: 0.001,
        bezierColor: "#fff",
        drawInputPoints: true,
        circleR: 10,
        drawMidPoints: true,
        drawMidPointLines: true,
        midPointR: 5,
        startRandomX: 0,
        endRandomX: 500,
        startRandomY: 0,
        endRandomY: 500,
        inputPointsColor: "#fff",
        colorPalette: [
          "#00a8ff",
          "#e84118",
          "#9c88ff",
          "#fbc531",
          "#4cd137",
          "#487eb0",
          "#0097e6",
          "#8c7ae6",
          "#273c75"
        ]
      },
      drawConfig
    );

    this.displayTime = this.drawConfig.startDisplayTime;

    this.inputPoints =
      points ||
      new Array(10)
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
              this.drawConfig.inputPointsColor
            )
        );
    this.layers = [];
  }

  draw(ctx) {
    const midPointsAtT = [
      this.inputPoints,
      ...this.calcMidPoints(this.inputPoints, this.displayTime)
    ];

    if (this.drawConfig.drawMidPointLines) {
      midPointsAtT.forEach((l, i) => {
        drawLineWithMultiplePoints(
          ctx,
          l,
          this.drawConfig.colorPalette[i % this.drawConfig.colorPalette.length]
        );
      });
    }
    if (this.drawConfig.drawBezierLine) {
      drawLineWithMultiplePoints(
        ctx,
        [
          this.inputPoints[0],
          ...this.calcBezierPointsTroughTime(
            this.inputPoints,
            this.drawConfig.bezierDt
          ),
          this.inputPoints[this.inputPoints.length - 1]
        ],
        this.drawConfig.bezierColor,
        3
      );
    }

    if (this.drawConfig.drawMidPoints) {
      midPointsAtT.forEach((layer, i) => {
        const midPointColor =
          i == midPointsAtT.length - 1
            ? this.drawConfig.bezierColor
            : this.drawConfig.colorPalette[
                i % this.drawConfig.colorPalette.length
              ];
        layer.forEach(p => {
          drawCircle(ctx, p.x, p.y, this.drawConfig.midPointR, midPointColor);
        });
      });
    }

    if (this.drawConfig.drawInputPoints) {
      this.inputPoints.forEach(p => {
        drawCircle(
          ctx,
          p.x,
          p.y,
          this.drawConfig.circleR,
          this.drawConfig.colorPalette[0],
          false,
          "#fff"
        );
      });
    }
  }

  calcMidPointsTroughTime(inputPoints, tStep = 0.01, tStart = 0, tEnd = 1) {
    const times = [];
    for (; tStart < tEnd; tStart += tStep) {
      times.push(this.calcMidPoints(inputPoints, tStart));
    }
    return times;
  }

  calcBezierPointsTroughTime(inputPoints, tStep = 0.01, tStart = 0, tEnd = 1) {
    const times = [];
    for (; tStart < tEnd; tStart += tStep) {
      const midPoints = this.calcMidPoints(inputPoints, tStart);
      times.push(midPoints[midPoints.length - 1][0]);
    }
    return times;
  }

  calcMidPoints(inputPoints, t) {
    const layers = [];
    do {
      if (layers.length == 0) {
        layers.push(vectorsToPoints(calcArrayMidPoints(inputPoints, t)));
      } else {
        layers.push(
          vectorsToPoints(calcArrayMidPoints(layers[layers.length - 1], t))
        );
      }
    } while (layers[layers.length - 1].length > 1);
    return layers;
  }
}

const calcArrayMidPoints = (arr, t) =>
  new Array(arr.length - 1)
    .fill(0)
    .map((_, i) => getMidPoint(arr[i], arr[i + 1], t));

export const vectorsToPoints = (vectors, color = "#000") =>
  vectors.map(v => new Point(v, color));

export const pointsToVectors = points => points.map(p => p.pos);

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
