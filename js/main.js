import Bezier from "./bezier.js";
import { drawCircle } from "./graphics.js";

const canvas = document.getElementById(`mainCanvas`);
const ctx = canvas.getContext("2d");
const beziers = [];
let dragging = undefined;

const handleResize = e => {
  const newRect = canvas.parentElement.getBoundingClientRect();
  canvas.width = newRect.width;
  canvas.height = newRect.height;

  drawBeziers();
};
const getMousePos = evt => {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
};

const drawBeziers = clear => {
  if (clear) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  beziers.forEach(b => b.draw(ctx));
};
handleResize();

beziers.push(
  new Bezier({
    drawConfig: {
      endRandomX: canvas.width,
      endRandomY: canvas.height
    }
  })
);
drawBeziers();

window.addEventListener("resize", handleResize);
window.addEventListener("mousedown", e => {
  const mousePos = getMousePos(e);

  beziers.forEach(b => {
    b.inputPoints.forEach(p => {
      const distance = p.pos
        .clone()
        .subtract(mousePos)
        .magnitude();
      if (distance <= b.drawConfig.circleR) {
        dragging = p;
      }
    });
  });
});
window.addEventListener("mousemove", e => {
  const mousePos = getMousePos(e);
  if (dragging) {
    dragging.x = mousePos.x;
    dragging.y = mousePos.y;
  }
  drawBeziers(true);
});
window.addEventListener("mouseup", e => {
  dragging = undefined;
});
