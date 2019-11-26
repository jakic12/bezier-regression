import { drawLine, drawLineWithMultiplePoints } from "./graphics.js";
import Vector2 from "./Vector2.js";

export const drawCoordinateSystem = ctx => {
  drawLine(ctx, 0, -ctx.canvas.height / 2, 0, ctx.canvas.height / 2, "#1d2528");
  drawLine(ctx, -ctx.canvas.width / 2, 0, ctx.canvas.width / 2, 0, "#1d2528");
};

export const drawFunction = (ctx, fnc, dX = 1) => {
  const points = [];
  for (let x = -ctx.canvas.width / 2; x <= ctx.canvas.width / 2; x += dX) {
    points.push(new Vector2(x, fnc(x)));
  }

  drawLineWithMultiplePoints(ctx, points, "#555");
};
