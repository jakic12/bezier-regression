import { getMidPoint } from "./bezier.js";
import Vector2 from "./Vector2.js";

export default (bezier, fnct, timeD) => {
    const errorStart = getError(bezier, fnct, timeD)
    const dLayersT = []
    const layers = bezier.calcMidPointsTroughTime(0,1,timeD)
    
    for(let t = timeD; t < 1; t += timeD){
        for(let l = layers.length - 1; l >= 0; l--){
            if(l  == layers.length - 1){ // if last layer
                dlayers[l][0] = dLayersT[l][0]
                dlayers[l][0] += mseDerivative(dLayersT[l][0], fnct(t))
            }else{
                for(let k = 0; k < layers[l].length; i++){
                    if(k-1 >= 0){
                        dlayers[l][k] += midPointDerivativeToFirst(t)*layers[l+1][k-1]
                    }
                    if(k < layers[l+1].length){
                        dlayers[l][k] += midPointDerivativeToSecond(t)*layers[l+1][k]
                    }
                }
            }
        }
    }

    console.log(dLayersT);
}

export const getError = (bezier, fnct, timeD) => {
    let mse = 0;
    for(let t = 0; t <= 1; t += timeD){
        const x =convertTtoX(bezier, t);
        mse += Math.pow(fnct(x) - bezier.calcEndPointAtT(t).y,2)/2
    }

    return mse/(1/timeD)
}

export const convertTtoX = (bezier, t) => {
    return getMidPoint(bezier.inputPoints[0], bezier.inputPoints[bezier.inputPoints.length - 1], t).x
}

export const midPointDerivativeToFirst = (t) => new Vector2(1 - t, 1 - t)
export const midPointDerivativeToSecond = (t) => new Vector2(t,t)

export const mseDerivative = (out, expected) => {
    return out - expected;
}
