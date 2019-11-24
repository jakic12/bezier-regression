export const drawCircle = (ctx, x, y, r, color, noFill, strokeColor) => {
  const prevStroke = ctx.strokeStyle;
  const prevFill = ctx.fillStyle;
  if (strokeColor) ctx.strokeStyle = strokeColor;
  if (color) ctx.fillStyle = color;

  ctx.beginPath();
  ctx.arc(
    ctx.canvas.width / 2 + x,
    ctx.canvas.height / 2 - y,
    r,
    0,
    2 * Math.PI
  );
  if (!noFill) ctx.fill();
  if (strokeColor) ctx.stroke();

  if (strokeColor) ctx.strokeStyle = prevStroke;
  if (color) ctx.fillStyle = prevFill;
};

export const drawLine = (ctx, x1, y1, x2, y2, color, thickness) => {
  const prevStroke = ctx.strokeStyle;
  const prevLineWidth = ctx.lineWidth;
  if (thickness) ctx.lineWidth = thickness;

  if (color) ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(ctx.canvas.width / 2 + x1, ctx.canvas.height / 2 - y1);
  ctx.lineTo(ctx.canvas.width / 2 + x2, ctx.canvas.height / 2 - y2);
  ctx.stroke();

  if (color) ctx.strokeStyle = prevStroke;
  if (thickness) ctx.lineWidth = prevLineWidth;
};

export const drawLineWithMultiplePoints = (ctx, points, color, thickness) => {
  const prevStroke = ctx.strokeStyle;
  const prevLineWidth = ctx.lineWidth;
  if (thickness) ctx.lineWidth = thickness;
  if (color) ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(
    ctx.canvas.width / 2 + points[0].x,
    ctx.canvas.height / 2 - points[0].y
  );
  points.forEach((p, i) => {
    if (i !== 0) {
      ctx.lineTo(
        ctx.canvas.width / 2 + points[i].x,
        ctx.canvas.height / 2 - points[i].y
      );
    }
  });
  ctx.stroke();

  if (color) ctx.strokeStyle = prevStroke;
  if (thickness) ctx.lineWidth = prevLineWidth;
};
