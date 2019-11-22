import Vector2 from "./Vector2"
import drawCircle from "graphics";


export default class Bezier{
    constructor(points, drawConfig){
        this.drawConfig = Object.assign({
            drawInputPoints:false,
            circleR:20,
        }, drawConfig)
        this.inputPoints = points || new Array(4).fill(0).map(() => new Vector2(Math.random()*500, Math.random()*500))
    }

    draw(ctx){
        if(this.config.drawInputPoints){
            this.inputPoints.forEach(p => {
                drawCircle(ctx, p.x, p.y, this.config.circleR)
            })
        }
    }
}

export const getMidPoint = (a, b, t = 0.5) => {
    return new Vector2(
        a.x + (b.x - a.x)*t,
        a.y + (b.y - a.y)*t
    )
}