import Bezier from "./bezier.js";

const canvas = document.getElementById(`mainCanvas`);
const ctx = canvas.getContext("2d");

const bezier1 = new Bezier();

const handleResize = e => {
  const newRect = canvas.parentElement.getBoundingClientRect();
  canvas.width = newRect.width;
  canvas.height = newRect.height;
};
handleResize();
window.addEventListener("resize", handleResize);

bezier1.draw(ctx);
