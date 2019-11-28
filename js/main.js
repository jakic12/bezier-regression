import Bezier, { vectorsToPoints } from "./bezier.js";
import { drawCircle } from "./graphics.js";
import { drawCoordinateSystem, drawFunction } from "./coordinateSystem.js";
import Vector2 from "./Vector2.js";
import Point from "./Point.js";
import regress, { getError } from "./regression.js";

const canvas = document.getElementById(`mainCanvas`);
const ctx = canvas.getContext("2d");

window.viewingCenter = new Vector2(0, 0);
const draggableView = true;

let bezierForRegression = 0;
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
  beziers.forEach(b => b.bezier.draw(ctx));
};
handleResize();
class BezierDom {
  constructor(bezier, canvas, parentContainer, removeBezierCallback) {
    this.id = new Date().getTime();
    this.bezier = bezier;
    this.canvas = canvas;
    this.dom = document.createElement("div");
    this.dom.className = "bezierCurve";
    this.parentContainer = parentContainer;

    const addButton = document.createElement("button");
    addButton.innerText = "add point";
    addButton.addEventListener("click", e => {
      this.addPoint();
    });

    const removeButton = document.createElement("button");
    removeButton.innerText = "delete point";
    removeButton.addEventListener("click", e => {
      this.removePoint();
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "delete curve";
    deleteButton.addEventListener("click", e => {
      this.removeBezier(removeBezierCallback);
    });

    const levelOutCurve = document.createElement("button");
    levelOutCurve.innerText = "level out curve";
    levelOutCurve.addEventListener("click", e => {
      this.levelOutCurve();
    });

    const chooseForRegression = document.createElement("button");
    chooseForRegression.innerText = "choose for regression";
    chooseForRegression.addEventListener("click", e => {
      let id;
      beziers.forEach((b, i) => {
        if (b.id === this.id) id = i;
      });

      console.log(bezierForRegression, id);

      beziers[bezierForRegression].removeFromRegression();
      bezierForRegression = id;
      this.chooseForRegression();
    });

    this.dom.appendChild(levelOutCurve);
    this.dom.appendChild(deleteButton);
    this.dom.appendChild(addButton);
    this.dom.appendChild(removeButton);
    this.dom.appendChild(chooseForRegression);
    this.parentContainer.appendChild(this.dom);
  }

  addPoint() {
    let addPointCallback = e => {
      let pos = getMousePos(e);
      this.bezier.inputPoints.push(new Point(pos));
      canvas.style.cursor = "auto";
      drawBeziers(true);
      canvas.removeEventListener("click", addPointCallback);
    };
    canvas.style.cursor = "copy";
    canvas.addEventListener("click", addPointCallback);
  }

  removePoint() {
    let removePointCallback = e => {
      let mousePos = getMousePos(e);
      let pointToRemove = undefined;

      this.bezier.inputPoints.forEach(p => {
        const distance = p.pos
          .clone()
          .subtract(mousePos.subtractNonMutative(window.viewingCenter))
          .magnitude();
        if (distance <= this.bezier.drawConfig.circleR) {
          pointToRemove = p;
        }
      });

      if (pointToRemove) {
        this.bezier.inputPoints = this.bezier.inputPoints.filter(
          p => p !== pointToRemove
        );
      }

      canvas.style.cursor = "auto";
      drawBeziers(true);
      canvas.removeEventListener("click", removePointCallback);
    };
    canvas.style.cursor = "crosshair";
    canvas.addEventListener("click", removePointCallback);
  }

  levelOutCurve() {
    this.bezier.inputPoints.forEach(p => {
      p.y = 0;
    });
    drawBeziers(true);
  }

  removeBezier(removeBezierCallback) {
    this.parentContainer.removeChild(this.dom);
    removeBezierCallback(this.id);
  }

  chooseForRegression() {
    this.dom.classList.add("chosenForRegression");
  }

  removeFromRegression() {
    this.dom.classList.remove("chosenForRegression");
  }
}

const addBezier = numOfPoints => {
  addDomBezier(
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
      )
    })
  );
};

const addDomBezier = bezier => {
  beziers.push(
    new BezierDom(bezier, canvas, document.getElementById("curves"), id => {
      let removedBezier;
      beziers = beziers.filter((b, i) => {
        if (b.id !== id) {
          return true;
        } else {
          removedBezier = i;
          return false;
        }
      });
      if (bezierForRegression >= removedBezier) {
        console.log(bezierForRegression, removedBezier);
        if (beziers[bezierForRegression]) {
          beziers[bezierForRegression].removeFromRegression();
        }
        bezierForRegression--;
      }
      beziers[bezierForRegression].chooseForRegression();
      drawBeziers(true);
    })
  );
};

const initBeziers = () => {
  if (window.location.href.includes("?beziers=")) {
    const beziersRaw = JSON.parse(
      decodeURI(window.location.href.split("?beziers=")[1])
    );
    const beziersObjectified = beziersRaw.map(
      br =>
        new Bezier({
          points: br.map(p => new Point(new Vector2(p.pos.x, p.pos.y), p.color))
        })
    );
    beziersObjectified.forEach(b => {
      addDomBezier(b);
    });
  } else {
    addBezier(10);
  }
};

initBeziers();

beziers[bezierForRegression].chooseForRegression();

// COOL STUFF

/*

every second across
idx = 0;
beziers[0].bezier.inputPoints = []
for(let i = 0; i < 2*Math.PI; i += 0.06){beziers[0].bezier.inputPoints.push(new Point(idx%2==0? new Vector2(Math.sin(i)*400,Math.cos(i)*400) : new Vector2(Math.sin(i-Math.PI)*400,Math.cos(i-Math.PI)*400), "red")); idx++}
url: ?beziers=%5B%5B%7B"pos":%7B"x":0,"y":400%7D,"color":"red"%7D,%7B"pos":%7B"x":-23.985602591777912,"y":-399.28021597408167%7D,"color":"red"%7D,%7B"pos":%7B"x":47.884882915567744,"y":397.1234543415465%7D,"color":"red"%7D,%7B"pos":%7B"x":-71.61182937032979,"y":-393.5374771152485%7D,"color":"red"%7D,%7B"pos":%7B"x":95.08105057085383,"y":388.53518994081185%7D,"color":"red"%7D,%7B"pos":%7B"x":-118.20808266453582,"y":-382.13459565024243%7D,"color":"red"%7D,%7B"pos":%7B"x":140.90969331003598,"y":374.35872947117394%7D,"color":"red"%7D,%7B"pos":%7B"x":-163.1041812238281,"y":-365.2355761249233%7D,"color":"red"%7D,%7B"pos":%7B"x":184.71167021659315,"y":354.79796911171366%7D,"color":"red"%7D,%7B"pos":%7B"x":-205.65439666124527,"y":-343.0834725455296%7D,"color":"red"%7D,%7B"pos":%7B"x":225.8569893580142,"y":330.1342459638713%7D,"color":"red"%7D,%7B"pos":%7B"x":-245.2467407893736,"y":-315.996892598946%7D,"color":"red"%7D,%7B"pos":%7B"x":263.75386878858933,"y":300.7222916563579%7D,"color":"red"%7D,%7B"pos":%7B"x":-281.31176768016417,"y":-284.36541520491085%7D,"color":"red"%7D,%7B"pos":%7B"x":297.85724798834383,"y":266.9851303365232%7D,"color":"red"%7D,%7B"pos":%7B"x":-313.33076385099343,"y":-248.64398730826562%7D,"color":"red"%7D,%7B"pos":%7B"x":327.6766273203994,"y":229.40799442898253%7D,"color":"red"%7D,%7B"pos":%7B"x":-340.8432087797453,"y":-209.34638050065962%7D,"color":"red"%7D,%7B"pos":%7B"x":352.7831227539791,"y":188.53134566949583%7D,"color":"red"%7D,%7B"pos":%7B"x":-363.4533984463534,"y":-167.03780158334297%7D,"color":"red"%7D,%7B"pos":%7B"x":372.8156343868906,"y":144.9431017906692%7D,"color":"red"%7D,%7B"pos":%7B"x":-380.8361366362064,"y":-122.32676335131542%7D,"color":"red"%7D,%7B"pos":%7B"x":387.4860400473062,"y":99.27018066094891%7D,"color":"red"%7D,%7B"pos":%7B"x":-392.74141214894394,"y":-75.85633251913339%7D,"color":"red"%7D,%7B"pos":%7B"x":396.5833392766746,"y":52.169483495257865%7D,"color":"red"%7D,%7B"pos":%7B"x":-398.9979946416218,"y":-28.29488066708076%7D,"color":"red"%7D,%7B"pos":%7B"x":399.97668809198655,"y":4.318446823306601%7D,"color":"red"%7D,%7B"pos":%7B"x":-399.51589738820957,"y":19.673528765668625%7D,"color":"red"%7D,%7B"pos":%7B"x":397.61728087923035,"y":-43.59470089594888%7D,"color":"red"%7D,%7B"pos":%7B"x":-394.2876715342213,"y":67.35897917963129%7D,"color":"red"%7D,%7B"pos":%7B"x":389.539052351278,"y":-90.88083787723528%7D,"color":"red"%7D,%7B"pos":%7B"x":-383.3885132315655,"y":114.07562369800881%7D,"color":"red"%7D,%7B"pos":%7B"x":375.8581894741298,"y":-136.85986046035976%7D,"color":"red"%7D,%7B"pos":%7B"x":-366.9751821127237,"y":159.15154951596693%7D,"color":"red"%7D,%7B"pos":%7B"x":356.77146038135163,"y":-180.87046485636526%7D,"color":"red"%7D,%7B"pos":%7B"x":-345.2837466595492,"y":201.93844183994352%7D,"color":"red"%7D,%7B"pos":%7B"x":332.55338431147294,"y":-222.27965850024552%7D,"color":"red"%7D,%7B"pos":%7B"x":-318.6261888944343,"y":241.82090842317234%7D,"color":"red"%7D,%7B"pos":%7B"x":303.55228327236836,"y":-260.49186421101876%7D,"color":"red"%7D,%7B"pos":%7B"x":-287.38591722764994,"y":278.2253305851614%7D,"color":"red"%7D,%7B"pos":%7B"x":270.18527222045986,"y":-294.95748621649864%7D,"color":"red"%7D,%7B"pos":%7B"x":-252.0122519983563,"y":310.6281134133177%7D,"color":"red"%7D,%7B"pos":%7B"x":232.93225980963217,"y":-325.18081483995644%7D,"color":"red"%7D,%7B"pos":%7B"x":-213.0139630222478,"y":338.56321648631064%7D,"color":"red"%7D,%7B"pos":%7B"x":192.32904599545867,"y":-350.7271561577129%7D,"color":"red"%7D,%7B"pos":%7B"x":-170.95195209353122,"y":361.62885680682484%7D,"color":"red"%7D,%7B"pos":%7B"x":148.95961577002146,"y":-371.22908408373337%7D,"color":"red"%7D,%7B"pos":%7B"x":-126.43118568682064,"y":379.49328753724313%7D,"color":"red"%7D,%7B"pos":%7B"x":103.44773986444346,"y":-386.3917249591901%7D,"color":"red"%7D,%7B"pos":%7B"x":-80.0919938887073,"y":391.8995694242739%7D,"color":"red"%7D,%7B"pos":%7B"x":56.44800322394601,"y":-395.9969986401783%7D,"color":"red"%7D,%7B"pos":%7B"x":-32.600860704106715,"y":398.66926628641875%7D,"color":"red"%7D,%7B"pos":%7B"x":8.636390290437495,"y":-399.90675508517137%7D,"color":"red"%7D,%7B"pos":%7B"x":15.359161802095086,"y":399.7050114130883%7D,"color":"red"%7D,%7B"pos":%7B"x":-39.29943749804436,"y":-398.0647613295321%7D,"color":"red"%7D,%7B"pos":%7B"x":63.098277657300386,"y":394.99190796354577%7D,"color":"red"%7D,%7B"pos":%7B"x":-86.67003215495289,"y":-390.4975102689637%7D,"color":"red"%7D,%7B"pos":%7B"x":109.92986812925068,"y":384.59774322411926%7D,"color":"red"%7D,%7B"pos":%7B"x":-132.79407528829466,"y":-377.31383961938997%7D,"color":"red"%7D,%7B"pos":%7B"x":155.18036717669315,"y":368.6720136420809%7D,"color":"red"%7D,%7B"pos":%7B"x":-177.00817731794194,"y":-358.7033665336583%7D,"color":"red"%7D,%7B"pos":%7B"x":198.19894916673894,"y":347.4437746588654%7D,"color":"red"%7D,%7B"pos":%7B"x":-218.67641882771576,"y":-334.9337603895514%7D,"color":"red"%7D,%7B"pos":%7B"x":238.36688952310658,"y":321.2183462678916%7D,"color":"red"%7D,%7B"pos":%7B"x":-257.1994968215645,"y":-306.34689297385415%7D,"color":"red"%7D,%7B"pos":%7B"x":275.10646367359044,"y":290.3729216800552%7D,"color":"red"%7D,%7B"pos":%7B"x":-292.02334433572065,"y":-273.3539214333336%7D,"color":"red"%7D,%7B"pos":%7B"x":307.88925630561044,"y":255.3511422562627%7D,"color":"red"%7D,%7B"pos":%7B"x":-322.64709943329683,"y":-236.4293747132117%7D,"color":"red"%7D,%7B"pos":%7B"x":336.2437614200784,"y":216.65671673427852%7D,"color":"red"%7D,%7B"pos":%7B"x":-348.6303089654356,"y":-196.10432853627916%7D,"color":"red"%7D,%7B"pos":%7B"x":359.7621638740714,"y":174.84617652281045%7D,"color":"red"%7D,%7B"pos":%7B"x":-369.5992634892753,"y":-152.9587670850718%7D,"color":"red"%7D,%7B"pos":%7B"x":378.10620487522544,"y":130.52087126147302%7D,"color":"red"%7D,%7B"pos":%7B"x":-385.2523722293267,"y":-107.61324124695962%7D,"color":"red"%7D,%7B"pos":%7B"x":391.01204706603886,"y":84.31831977231184%7D,"color":"red"%7D,%7B"pos":%7B"x":-395.3645007756522,"y":-60.71994339934223%7D,"color":"red"%7D,%7B"pos":%7B"x":398.29406922489807,"y":36.90304079980497%7D,"color":"red"%7D,%7B"pos":%7B"x":-399.7902091309136,"y":-12.953327103890247%7D,"color":"red"%7D,%7B"pos":%7B"x":399.84753600567416,"y":-11.043004581683947%7D,"color":"red"%7D,%7B"pos":%7B"x":-398.46584353433633,"y":34.99959337577785%7D,"color":"red"%7D,%7B"pos":%7B"x":395.65010431774806,"y":-58.830221428744245%7D,"color":"red"%7D,%7B"pos":%7B"x":-391.41045197645565,"y":82.4491242135823%7D,"color":"red"%7D,%7B"pos":%7B"x":385.76214468061255,"y":-105.77129918562098%7D,"color":"red"%7D,%7B"pos":%7B"x":-378.72551023704403,"y":128.7128116998874%7D,"color":"red"%7D,%7B"pos":%7B"x":370.3258729310935,"y":-151.19109708519082%7D,"color":"red"%7D,%7B"pos":%7B"x":-360.5934623865427,"y":173.12525778777922%7D,"color":"red"%7D,%7B"pos":%7B"x":349.5633047716098,"y":-194.43635451517457%7D,"color":"red"%7D,%7B"pos":%7B"x":-337.2750967425678,"y":215.0476903323807%7D,"color":"red"%7D,%7B"pos":%7B"x":323.77306257864905,"y":-234.88508668802757%7D,"color":"red"%7D,%7B"pos":%7B"x":-309.1057950223964,"y":253.87715037705192%7D,"color":"red"%7D,%7B"pos":%7B"x":293.32608039826425,"y":-271.95553047914103%7D,"color":"red"%7D,%7B"pos":%7B"x":-276.49070863885265,"y":289.0551643482349%7D,"color":"red"%7D,%7B"pos":%7B"x":258.66026890247554,"y":-305.1145117677936%7D,"color":"red"%7D,%7B"pos":%7B"x":-239.8989315176198,"y":320.0757764291206%7D,"color":"red"%7D,%7B"pos":%7B"x":220.2742170390577,"y":-333.88511393566216%7D,"color":"red"%7D,%7B"pos":%7B"x":-199.85675324676376,"y":346.4928255846897%7D,"color":"red"%7D,%7B"pos":%7B"x":178.72002096217514,"y":-357.85353722896144%7D,"color":"red"%7D,%7B"pos":%7B"x":-156.9400895965848,"y":367.9263625746542%7D,"color":"red"%7D,%7B"pos":%7B"x":134.59534338340532,"y":-376.67505032786977%7D,"color":"red"%7D,%7B"pos":%7B"x":-111.7661992795741,"y":384.06811466014534%7D,"color":"red"%7D,%7B"pos":%7B"x":88.53481755134757,"y":-390.0789485234362%7D,"color":"red"%7D,%7B"pos":%7B"x":-64.98480608606587,"y":394.68591940675617%7D,"color":"red"%7D,%7B"pos":%7B"x":41.20091949404333,"y":-397.87244718985676%7D,"color":"red"%7D,%7B"pos":%7B"x":-17.268754083496088,"y":399.6270638137559%7D,"color":"red"%7D%5D%5D


every second in the middle
idx = 0;
beziers[0].bezier.inputPoints = []
for(let i = 0; i < 2*Math.PI; i += 0.06){beziers[0].bezier.inputPoints.push(new Point(idx%2==0? new Vector2(Math.sin(i)*400,Math.cos(i)*400) : new Vector2(0,0), "red")); idx++}
*/

// COOL STUFF

let dragging = undefined;
let draggingView = false;

window.addEventListener("resize", handleResize);
canvas.addEventListener("mousedown", e => {
  const mousePos = getMousePos(e);
  let clickedPoint = false;

  beziers.forEach(b => {
    b.bezier.inputPoints.forEach(p => {
      const distance = p.pos
        .clone()
        .subtract(mousePos.subtractNonMutative(window.viewingCenter))
        .magnitude();
      if (distance <= b.bezier.drawConfig.circleR) {
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
    canvas.style.cursor = "grabbing";
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
    b.bezier.drawConfig.drawMidPointLines = displayMidPointLines.checked;
    b.bezier.drawConfig.drawMidPoints = displayMidPointLines.checked;
  });
  drawBeziers(true);
};

handleDisplayMidPointLines();
displayMidPointLines.addEventListener("click", handleDisplayMidPointLines);

const handleTimePosition = e => {
  beziers.forEach(b => {
    b.bezier.displayTime = timePosition.value / timePosition.max;
  });
  drawBeziers(true);
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
      b.bezier.drawConfig.bezierDt = dT;
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
    toggleButton.classList.add("running");
    regressionRunning = true;
    let iter = 0;
    (function regressionLoop() {
      const error = getError(
        beziers[bezierForRegression].bezier,
        regressionFunction,
        dT
      );
      if (iter % graphErrorEvery == 0) addErrorReading(iter, error, 100);

      errorDiv.innerText = error;
      if (regressionRunning) {
        beziers[bezierForRegression].bezier.inputPoints = regress(
          beziers[bezierForRegression].bezier,
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
    toggleButton.classList.remove("running");
    clearInterval(regressionRunning);
    regressionRunning = false;
  }
});

let cyclingFunctions = false;
const functionsToCycle = [
  x => Math.sin(x / 100) * 300,
  x => Math.pow(x / 50, 3),
  x => Math.pow(x / 50, 2),
  x => x,
  x => Math.sin(x / 100) * 300 + x,
  x =>
    (Math.sin(x / 100) * 200 +
      Math.sin((2 * x) / 100) * 100 -
      Math.sin(x / 20) * 50) *
    Math.sin(x / 60)
];
const cycleButton = document.getElementById("cycleFunctions");

cycleButton.addEventListener("click", e => {
  if (!cyclingFunctions) {
    cycleButton.innerText = `Stop`;
    cycleButton.classList.add("running");
    let i = 0;
    cyclingFunctions = setInterval(() => {
      regressionFunction = functionsToCycle[i++ % functionsToCycle.length];
      drawBeziers(true);
    }, 5000);
  } else {
    cycleButton.classList.remove("running");
    cycleButton.innerText = `Cycle trough functions`;
    clearInterval(cyclingFunctions);
    cyclingFunctions = false;
  }
});

document.getElementById("addCurve").onsubmit = e => {
  e.preventDefault();

  const numOfPoints = +document.getElementById("numberOfPoints").value;

  document.getElementById("numberOfPoints").value = "";

  addBezier(numOfPoints);
  drawBeziers(true);
};

shareButton.addEventListener("click", e => {
  const outPoints = beziers.map(b => b.bezier.inputPoints);
  const uri = encodeURI(JSON.stringify(outPoints));
  history.pushState(null, null, `?beziers=${uri}`);
});
//ui

drawBeziers(true);
