import Bezier from "bezier"

const canvas = document.getElementById(`mainCanvas`)
const ctx = canvas.getContext("2d")

const bezier1 = new Bezier();


bezier1.draw(ctx)