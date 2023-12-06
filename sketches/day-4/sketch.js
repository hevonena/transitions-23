import { VerletPhysics } from "../../shared/verletPhysics.js"
import { DragManager } from "../../shared/dragManager.js"
import { SpringNumber } from "../../shared/spring.js"


const physics = new VerletPhysics()
const dragManager = new DragManager()


let sceneSize, centerX, centerY, objSize, strokeW
let finished = false

let spring

window.setup = function () {
    createCanvas(windowWidth, windowHeight)
    sceneSize = min(width, height)
    centerX = width / 2
    centerY = height / 2
    objSize = sceneSize / 2
    strokeW = 20

    spring = new SpringNumber({
        position: 0, // start position
        frequency: 6.5, // oscillations per second (approximate)
        halfLife: 0.9 // time until amplitude is halved
    })
}

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight)
}

window.mouseClicked = function () {
}

window.draw = function () {
    background(255)

    sceneSize = min(width, height)
    centerX = width / 2
    centerY = height / 2
    objSize = sceneSize / 2
    strokeW = 20

    dragManager.update()
    physics.update()

    drawSquare()
    drawCircle()
}

function drawCross() {
    fill(0)
    noStroke()
    rectMode(CENTER)
    strokeWeight(strokeW)
    stroke(0)
    line(centerX - objSize / 2, centerY, centerX + objSize / 2, centerY)
    line(centerX, centerY - objSize / 2, centerX, centerY + objSize / 2)
}

function drawCircle() {
    fill(255, 0, 0, 100)
    noStroke()
    circle(centerX, centerY, objSize)
}

function drawGrid() {
    fill(0)
    noStroke()
    for (let x = 0; x < gridCount; x++) {
        for (let y = 0; y < gridCount; y++) {
            const xPos = map(x, 0, gridCount - 1, centerX - objSize / 2, centerX + objSize / 2, x)
            const yPos = map(y, 0, gridCount - 1, centerY - objSize / 2, centerY + objSize / 2, y)
            circle(xPos, yPos, strokeW)
        }
    }
}

function drawSquare() {
    fill(0, 255, 0, 100)
    noStroke()
    rectMode(CENTER)
    rect(centerX, centerY, objSize, objSize)
}
