import Bezier, { vectorsToPoints } from "./bezier.js";
import { drawCircle } from "./graphics.js";
import { drawCoordinateSystem, drawFunction } from "./coordinateSystem.js";
import Vector2 from "./Vector2.js";
import regress, { getError } from "./regression.js";

const canvas = document.getElementById(`mainCanvas`);
const ctx = canvas.getContext("2d");
var beziers = [];

window.beziers = beziers;
window.BezierGlobal = Bezier;

let regressionFunction = x => Math.sin(x / 100) * 300;
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
    x: evt.clientX - rect.left - canvas.width / 2,
    y: -evt.clientY - rect.top + canvas.height / 2
  };
};

const drawBeziers = clear => {
  if (clear) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  drawCoordinateSystem(ctx);
  drawFunction(ctx, regressionFunction);
  beziers.forEach(b => b.draw(ctx));

  if (beziers[0]) {
    console.log(getError(beziers[0], regressionFunction, 0.01));
  }
};
handleResize();

const numOfPoints = 5;
beziers.push(
  new Bezier({
    points: vectorsToPoints(
      new Array(numOfPoints)
        .fill(0)
        .map(
          (_, i) =>
            new Vector2(
              i * (canvas.width / (numOfPoints - 1)) - canvas.width / 2,
              (Math.random() * canvas.height * 2) / 2 - canvas.height / 2
            )
        )
    ),
    drawConfig: {
      endRandomX: canvas.width,
      endRandomY: canvas.height
    }
  })
);

// COOL STUFF

/*

every second across
idx = 0;
for(let i = 0; i < 2*Math.PI; i += 0.06){beziers[0].inputPoints.push(new Point(idx%2==0? new Vector2(Math.sin(i)*400,Math.cos(i)*400) : new Vector2(Math.sin(i-Math.PI)*400,Math.cos(i-Math.PI)*400), "red")); idx++}

every second in the middle
idx = 0;
for(let i = 0; i < 2*Math.PI; i += 0.06){beziers[0].inputPoints.push(new Point(idx%2==0? new Vector2(Math.sin(i)*400,Math.cos(i)*400) : new Vector2(0,0), "red")); idx++}
*/

// COOL STUFF

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

//ui
const displayMidPointLines = document.getElementById("displayHelpers");
const animateMidPointLines = document.getElementById("animateHelpers");
const timePosition = document.getElementById("timePosition");

const handleDisplayMidPointLines = e => {
  beziers.forEach(b => {
    b.drawConfig.drawMidPointLines = displayMidPointLines.checked;
    b.drawConfig.drawMidPoints = displayMidPointLines.checked;
  });
  drawBeziers(true);
};

handleDisplayMidPointLines();
displayMidPointLines.addEventListener("click", handleDisplayMidPointLines);

const handleTimePosition = e => {
  beziers.forEach(b => {
    b.displayTime = timePosition.value / timePosition.max;
  });
};

handleTimePosition();
timePosition.addEventListener("input", handleTimePosition);

let animate = false;
let tPosition = 0;

const handleAnimateMidPointLines = e => {
  if (animateMidPointLines.checked) {
    animateMidPointLines.checked = true;
    timePosition.disabled = true;

    const animateFrame = () => {
      timePosition.value = (Math.sin(tPosition) / 2 + 0.5) * timePosition.max;
      tPosition += 0.01;
      handleTimePosition();
      drawBeziers(true);

      if (animateMidPointLines.checked) requestAnimationFrame(animateFrame);
    };

    animateFrame();
  } else {
    animateMidPointLines.checked = false;
    animate = false;
    timePosition.disabled = false;
  }
};
animateMidPointLines.addEventListener("click", handleAnimateMidPointLines);

var functionEditor = ace.edit("functionEditor");
functionEditor.setTheme("ace/theme/monokai");
functionEditor.session.setMode("ace/mode/javascript");
functionEditor.setValue(regressionFunction.toString(), 1);

functionEditor.session.on("change", delta => {
  try {
    regressionFunction = eval(functionEditor.getValue());
    drawBeziers(true);
  } catch (e) {
    console.error(e);
  }
});

let regressionRunning = false;
const graphErrorEvery = 10;
const errorDiv = document.getElementById("errorDiv");
const toggleButton = document.getElementById("toggleRegression");

const buttonTexts = { on: `stop regression`, off: `start regression` };
toggleButton.innerText = buttonTexts.off;

var errorChartCtx = document.getElementById("errorChart").getContext("2d");
var errorChart = new Chart(errorChartCtx, {
  type: "line",
  data: {
    datasets: [
      {
        label: "error",
        data: []
      }
    ]
  },
  options: {
    scales: {
      xAxes: [
        {
          type: "linear",
          position: "bottom"
        }
      ]
    },
    animation: {
      duration: 0
    }
  }
});

const addErrorReading = (iteration, error, max) => {
  if (!errorChart.data.datasets[0]) {
    errorChart.data.datasets[0] = [];
  }
  errorChart.data.datasets[0].data.push({ x: iteration, y: error });
  if (max && errorChart.data.datasets[0].data.length > max) {
    errorChart.data.datasets[0].data.shift();
  }
  errorChart.update();
};

const clearErrorReadings = () => {
  errorChart.data.datasets[0].data = [];
};

toggleButton.addEventListener("click", () => {
  if (!regressionRunning) {
    clearErrorReadings();
    toggleButton.innerText = buttonTexts.on;
    regressionRunning = true;
    let iter = 0;
    (function regressionLoop() {
      const error = getError(beziers[0], regressionFunction, 0.01);
      if (iter % graphErrorEvery == 0) addErrorReading(iter, error, 100);

      errorDiv.innerText = error;
      if (regressionRunning) {
        beziers[0].inputPoints = regress(
          beziers[0],
          regressionFunction,
          0.01,
          0.001
        );
        drawBeziers(true);
        requestAnimationFrame(regressionLoop);
      }
      iter++;
    })();
  } else {
    toggleButton.innerText = buttonTexts.off;
    clearInterval(regressionRunning);
    regressionRunning = false;
  }
});
//ui

drawBeziers();
