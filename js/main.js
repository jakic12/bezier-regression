import Bezier, { vectorsToPoints } from "./bezier.js";
import { drawCircle } from "./graphics.js";
import { drawCoordinateSystem, drawFunction } from "./coordinateSystem.js";
import Vector2 from "./Vector2.js";
import regress, { getError } from "./regression.js";

const canvas = document.getElementById(`mainCanvas`);
const ctx = canvas.getContext("2d");

window.viewingCenter = new Vector2(0, 0);
const draggableView = true;

var beziers = [];

window.beziers = beziers;
window.BezierGlobal = Bezier;

let regressionFunction = x => x;

const handleResize = e => {
  const newRect = canvas.parentElement.getBoundingClientRect();
  canvas.width = newRect.width;
  canvas.height = newRect.height;

  drawBeziers(true);
};
const getMousePos = evt => {
  var rect = canvas.getBoundingClientRect();
  return new Vector2(
    evt.clientX - rect.left - canvas.width / 2,
    -evt.clientY - rect.top + canvas.height / 2
  );
};

const drawBeziers = clear => {
  if (clear) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  drawCoordinateSystem(ctx);
  drawFunction(ctx, regressionFunction);
  beziers.forEach(b => b.draw(ctx));
};
handleResize();

const numOfPoints = 10;
beziers.push(
  new Bezier({
    points: vectorsToPoints(
      new Array(numOfPoints)
        .fill(0)
        .map(
          (_, i) =>
            new Vector2(
              (i * (canvas.width / (numOfPoints - 1)) - canvas.width / 2) *
                (+canvas.width > 1200 ? 0.6 : 0.8),
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

let dragging = undefined;
let draggingView = false;

window.addEventListener("resize", handleResize);
canvas.addEventListener("mousedown", e => {
  const mousePos = getMousePos(e);
  let clickedPoint = false;

  beziers.forEach(b => {
    b.inputPoints.forEach(p => {
      const distance = p.pos
        .clone()
        .subtract(mousePos.subtractNonMutative(window.viewingCenter))
        .magnitude();
      if (distance <= b.drawConfig.circleR) {
        clickedPoint = true;
        dragging = p;
      }
    });
  });

  if (!clickedPoint && draggableView) {
    draggingView = {
      mouse: getMousePos(e),
      view: window.viewingCenter.clone()
    };
    canvas.style.cursor = "grab";
  }
});
window.addEventListener("mousemove", e => {
  const mousePos = getMousePos(e);
  if (dragging) {
    dragging.x = mousePos.x - window.viewingCenter.x;
    dragging.y = mousePos.y - window.viewingCenter.y;

    drawBeziers(true);
  } else {
    if (draggableView && draggingView) {
      window.viewingCenter.x =
        draggingView.view.x + (mousePos.x - draggingView.mouse.x);
      window.viewingCenter.y =
        draggingView.view.y + (mousePos.y - draggingView.mouse.y);
      drawBeziers(true);
    }
  }
});
window.addEventListener("mouseup", e => {
  dragging = undefined;
  canvas.style.cursor = "auto";
  draggingView = undefined;
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

const defaultRegText = `x => 
  Math.sin(x / 100) * 300
  // Math.pow(x / 50, 3)
  // Math.pow(x / 50, 2)
  // x
  // Math.sin(x / 100) * 300 +x;`;

regressionFunction = eval(defaultRegText);
functionEditor.setValue(defaultRegText, 1);

functionEditor.session.on("change", delta => {
  try {
    regressionFunction = eval(functionEditor.getValue());
    drawBeziers(true);
  } catch (e) {
    console.error(e);
  }
});

let regressionRunning = false;
let graphErrorEvery = 10;
document.getElementById("graphIterations").value = graphErrorEvery;
document.getElementById("graphIterations").addEventListener("input", e => {
  if (e.target.value > 0) {
    graphErrorEvery = +e.target.value;
    drawBeziers(true);
  } else {
    e.target.value = graphErrorEvery;
  }
});

let learningRate = 0.03;
document.getElementById("learningRate").value = learningRate;
document.getElementById("learningRate").addEventListener("input", e => {
  if (e.target.value > 0) {
    learningRate = +e.target.value;
    drawBeziers(true);
  } else {
    e.target.value = learningRate;
  }
});

let dT = 0.01;
document.getElementById("dTInput").value = dT;
document.getElementById("dTInput").addEventListener("input", e => {
  if (e.target.value > 0) {
    dT = +e.target.value;

    beziers.forEach(b => {
      b.drawConfig.bezierDt = dT;
    });
    drawBeziers(true);
  } else {
    e.target.value = dT;
  }
});

const errorDiv = document.getElementById("errorDiv");
const toggleButton = document.getElementById("toggleRegression");

const buttonTexts = { on: `stop regression`, off: `start regression` };
toggleButton.innerText = buttonTexts.off;

var errorChartCtx = document.getElementById("errorChart").getContext("2d");
Chart.defaults.global.defaultFontColor = "white";
var errorChart = new Chart(errorChartCtx, {
  type: "line",
  data: {
    datasets: [
      {
        label: "error",
        data: [],
        borderColor: "#78dce8",
        pointBackgroundColor: "#78dce8",
        pointBorderColor: "#78dce8",
        pointHoverBackgroundColor: "#ff6188",
        pointHoverBorderColor: "#ff6188"
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
    },
    legend: {
      labels: {
        fontColor: "white"
      }
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
      const error = getError(beziers[0], regressionFunction, dT);
      if (iter % graphErrorEvery == 0) addErrorReading(iter, error, 100);

      errorDiv.innerText = error;
      if (regressionRunning) {
        beziers[0].inputPoints = regress(
          beziers[0],
          regressionFunction,
          dT,
          learningRate
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

drawBeziers(true);
