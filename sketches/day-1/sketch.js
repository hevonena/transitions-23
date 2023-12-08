import { VerletPhysics } from "./verletPhysics.js"
import { DragManager } from "../../shared/dragManager.js"
import { sendSequenceNextSignal } from "../../shared/sequenceRunner.js"
import { SpringNumber } from "../../shared/spring.js"

const physics = new VerletPhysics()
const dragManager = new DragManager()

let quadrant1
let quadrant2
let quadrant3
let quadrant4
let debug = false
let finished = false

//mouse release


let sceneSize, centerX, centerY, objSize, strokeW
let spring1, spring2, spring3, spring4
let plop1 = false
let plop2 = false
let plop3 = false
let plop4 = false
let mail, plop

window.preload = function () {
    mail = loadSound("asset/mail.mp3")
    plop = loadSound("asset/plop.wav")
}

window.setup = function () {

    createCanvas(windowWidth, windowHeight)
    sceneSize = min(width, height)

    spring1 = new SpringNumber({
        position: 0, // start position
        frequency: 4.5, // oscillations per second (approximate)
        halfLife: 0.15 // time until amplitude is halved
    })
    spring2 = new SpringNumber({
        position: 0, // start position
        frequency: 4.5, // oscillations per second (approximate)
        halfLife: 0.15 // time until amplitude is halved
    })
    spring3 = new SpringNumber({
        position: 0, // start position
        frequency: 4.5, // oscillations per second (approximate)
        halfLife: 0.15 // time until amplitude is halved
    })
    spring4 = new SpringNumber({
        position: 0, // start position
        frequency: 4.5, // oscillations per second (approximate)
        halfLife: 0.15 // time until amplitude is halved
    })




    centerX = width / 2
    centerY = height / 2
    objSize = sceneSize / 2
    strokeW = 20

    quadrant1 = physics.createQuarter({ startPositionX: centerX, startPositionY: centerY, size: objSize / 2 - strokeW / 2, quadrant: 1, elementCount: 32 })
    quadrant2 = physics.createQuarter({ startPositionX: centerX, startPositionY: centerY, size: objSize / 2 - strokeW / 2, quadrant: 2, elementCount: 32 })
    quadrant3 = physics.createQuarter({ startPositionX: centerX, startPositionY: centerY, size: objSize / 2 - strokeW / 2, quadrant: 3, elementCount: 32 })
    quadrant4 = physics.createQuarter({ startPositionX: centerX, startPositionY: centerY, size: objSize / 2 - strokeW / 2, quadrant: 4, elementCount: 32 })

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

    spring1.step(deltaTime / 1000)
    spring2.step(deltaTime / 1000)
    spring3.step(deltaTime / 1000)
    spring4.step(deltaTime / 1000)

    updateCross()

    if (!finished && n === 4) {
        setTimeout(() => {
            finished = true
            sendSequenceNextSignal()
            noLoop()
        }, 1000)
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
    //noStroke()
    strokeJoin(BEVEL)
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


    //drawCircle()
    if (debug)
        physics.displayDebug()

}

function drawCross(x, y, size, strokeW) {
    fill(0)
    noStroke()
    rectMode(CENTER)
    strokeWeight(strokeW)
    //strokeCap(SQUARE)
    stroke(0)
    let p1 = { x: lerp(x - size / 2 + strokeW / 2, x - size / 2, spring1.position), y: y }
    let p2 = { x: lerp(x + size / 2 - strokeW / 2, x + size / 2, spring2.position), y: y }
    let p3 = { x: x, y: lerp(y - size / 2 + strokeW / 2, y - size / 2, spring3.position) }
    let p4 = { x: x, y: lerp(y + size / 2 - strokeW / 2, y + size / 2, spring4.position) }
    line(p1.x, p1.y, p2.x, p2.y)
    line(p3.x, p3.y, p4.x, p4.y)
}

function updateCross() {
    if (notOnScreen(quadrant1.bodies) && notOnScreen(quadrant2.bodies)) {
        if (!plop1) {
            plop.play()
            plop1 = true
        }
        spring3.target = 1
    }
    if (notOnScreen(quadrant2.bodies) && notOnScreen(quadrant3.bodies)) {
        if (!plop2) {
            plop.play()
            plop2 = true
        }
        spring1.target = 1
    }
    if (notOnScreen(quadrant3.bodies) && notOnScreen(quadrant4.bodies)) {
        if (!plop3) {
            plop.play()
            plop3 = true
        }
        spring4.target = 1
    }
    if (notOnScreen(quadrant4.bodies) && notOnScreen(quadrant1.bodies)) {
        if (!plop4) {
            plop.play()
            plop4 = true
        }
        spring2.target = 1
    }

}

function drawCircle() {
    fill(0, 255, 255, 100)
    noStroke()
    circle(centerX, centerY, objSize)
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