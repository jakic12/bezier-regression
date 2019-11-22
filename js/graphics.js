export const drawCircle = (ctx,x,y,r,color) => {
    const prevFill = ctx.fillStyle
    ctx.fillStyle = color

    ctx.beginPath();
    ctx.arc(x,y,r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = prevFill
}