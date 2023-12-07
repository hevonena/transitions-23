import { VerletPhysics } from "./verletPhysics.js"
import { DragManager } from "../../shared/dragManager.js"
import { sendSequenceNextSignal } from "../../shared/sequenceRunner.js"

const physics = new VerletPhysics()
const dragManager = new DragManager()

let quadrant1
let quadrant2
let quadrant3
let quadrant4
let debug = false
let finished = false

let mail

window.preload = function () {
    mail = loadSound("asset/mail.mp3")
}

window.setup = function () {

    createCanvas(windowWidth, windowHeight)
    const sceneSize = min(width, height)

    const centerX = width / 2
    const centerY = height / 2
    const objSize = sceneSize / 2

    quadrant1 = physics.createQuarter({ startPositionX: centerX, startPositionY: centerY, size: objSize / 2, quadrant: 1, elementCount: 32 })
    quadrant2 = physics.createQuarter({ startPositionX: centerX, startPositionY: centerY, size: objSize / 2, quadrant: 2, elementCount: 32 })
    quadrant3 = physics.createQuarter({ startPositionX: centerX, startPositionY: centerY, size: objSize / 2, quadrant: 3, elementCount: 32 })
    quadrant4 = physics.createQuarter({ startPositionX: centerX, startPositionY: centerY, size: objSize / 2, quadrant: 4, elementCount: 32 })

    for (const o of quadrant1.bodies) {

        dragManager.createDragObject({
            target: o,
            onStartDrag: o => {
                o.isFixed = true
            },
            onStopDrag: o => {
                o.isFixed = false
                mail.play()
            }
        })
    }
    for (const o of quadrant2.bodies) {

        dragManager.createDragObject({
            target: o,
            onStartDrag: o => {
                o.isFixed = true
            },
            onStopDrag: o => {
                o.isFixed = false
                mail.play()
            }
        })
    }
    for (const o of quadrant3.bodies) {

        dragManager.createDragObject({
            target: o,
            onStartDrag: o => {
                o.isFixed = true
            },
            onStopDrag: o => {
                o.isFixed = false
                mail.play()
            }
        })
    }
    for (const o of quadrant4.bodies) {

        dragManager.createDragObject({
            target: o,
            onStartDrag: o => {
                o.isFixed = true
            },
            onStopDrag: o => {
                o.isFixed = false
                mail.play()
            }
        })
    }

    angleMode(DEGREES)
}

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight)
}

window.mouseClicked = function () {
}
window.keyPressed = function () {

    if (key === "d") {
        debug = !debug
    }
}

window.draw = function () {
    let n = 0
    notOnScreen(quadrant1.bodies) ? n++ : null
    notOnScreen(quadrant2.bodies) ? n++ : null
    notOnScreen(quadrant3.bodies) ? n++ : null
    notOnScreen(quadrant4.bodies) ? n++ : null
    n === 4 ? finished = true : null
    //finished ? console.log("ok") : null
    if (finished) {
        sendSequenceNextSignal()
        noLoop()
    }

    background(255)
    const sceneSize = min(width, height)

    const centerX = width / 2
    const centerY = height / 2
    const objSize = sceneSize / 2
    const halfWidth = objSize / tan(60)
    const strokeW = 20

    drawCross(centerX, centerY, objSize, strokeW)

    dragManager.update()
    physics.update()

    fill(0)
    // piece 1
    beginShape()
    const firstBody1 = quadrant1.bodies[0]
    vertex(firstBody1.positionX, firstBody1.positionY)

    for (const body of quadrant1.bodies) {
        curveVertex(body.positionX, body.positionY)
    }

    vertex(firstBody1.positionX, firstBody1.positionY)
    endShape()


    // piece 2
    beginShape()
    const firstBody2 = quadrant2.bodies[0]
    vertex(firstBody2.positionX, firstBody2.positionY)

    for (const body of quadrant2.bodies) {
        curveVertex(body.positionX, body.positionY)
    }

    vertex(firstBody2.positionX, firstBody2.positionY)
    endShape()

    // piece 3
    beginShape()
    const firstBody3 = quadrant3.bodies[0]
    vertex(firstBody3.positionX, firstBody3.positionY)

    for (const body of quadrant3.bodies) {
        curveVertex(body.positionX, body.positionY)
    }

    vertex(firstBody3.positionX, firstBody3.positionY)
    endShape()

    // piece 4
    beginShape()
    const firstBody4 = quadrant4.bodies[0]
    vertex(firstBody4.positionX, firstBody4.positionY)

    for (const body of quadrant4.bodies) {
        curveVertex(body.positionX, body.positionY)
    }

    vertex(firstBody4.positionX, firstBody4.positionY)
    endShape()

    if (debug)
        physics.displayDebug()

}

function drawCross(x, y, size, strokeW) {
    fill(0)
    noStroke()
    rectMode(CENTER)
    strokeWeight(strokeW)
    stroke(0)
    line(x - size / 2, y, x + size / 2, y)
    line(x, y - size / 2, x, y + size / 2)
}

function drawCircle(x, y, size) {
    fill(0)
    noStroke()
    circle(x, y, size)
}

function notOnScreen(bodiies) {
    let n = 0
    for (const body of bodiies) {
        if (body.positionX > width || body.positionX < 0 || body.positionY > height || body.positionY < 0) {
            n++
        }
    }
    if (n === bodiies.length) {
        return true
    }
    return false
}