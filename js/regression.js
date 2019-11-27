import { getMidPoint } from "./bezier.js";
import Vector2 from "./Vector2.js";

export default (bezier, fnct, timeD, learningRate = 0.01) => {
  const dLayersT = [];
  const layers = bezier
    .calcMidPointsTroughTime(timeD)
    .map(t => [bezier.inputPoints, ...t]);

  let idx = 0;
  for (let t = timeD; t < 1; t += timeD) {
    dLayersT.push([]);

    for (let l = layers[idx].length - 1; l >= 0; l--) {
      dLayersT[idx][l] = new Array(layers[idx][l].length).fill(0);

      if (l == layers[idx].length - 1) {
        // if last layer
        dLayersT[idx][l][0] = mseDerivative(
          layers[idx][l][0].y,
          fnct(convertTtoX(bezier, t))
        );
      } else {
        for (let k = 0; k < layers[idx][l].length; k++) {
          if (k - 1 >= 0) {
            dLayersT[idx][l][k] +=
              midPointDerivativeToSecond(t).y * layers[idx][l + 1][k - 1].y;
          }
          if (k < layers[idx][l + 1].length) {
            dLayersT[idx][l][k] +=
              midPointDerivativeToFirst(t).y * layers[idx][l + 1][k].y;
          }
        }
      }
    }

    idx++;
  }

  const out = bezier.inputPoints.slice(0).map(e => e.clone());
  dLayersT.forEach(layerAtT =>
    layerAtT[0].forEach((inputPointDelta, i) => {
      out[i].y -= learningRate * inputPointDelta;
    })
  );
  return out;
};

export const getError = (bezier, fnct, timeD) => {
  let mse = 0;
  for (let t = 0; t <= 1; t += timeD) {
    const x = convertTtoX(bezier, t);
    mse += Math.pow(fnct(x) - bezier.calcEndPointAtT(t).y, 2) / 2;
  }

  return mse / (1 / timeD);
};

export const convertTtoX = (bezier, t) => {
  return getMidPoint(
    bezier.inputPoints[0],
    bezier.inputPoints[bezier.inputPoints.length - 1],
    t
  ).x;
};

export const midPointDerivativeToFirst = t => new Vector2(1 - t, 1 - t);
export const midPointDerivativeToSecond = t => new Vector2(t, t);

export const mseDerivative = (out, expected) => {
  return out - expected;
};
