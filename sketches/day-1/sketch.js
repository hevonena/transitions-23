import { VerletPhysics } from "../../shared/verletPhysics.js"
import { DragManager } from "../../shared/dragManager.js"

const physics = new VerletPhysics()
const dragManager = new DragManager()

let blobs = []
let quadrant1
let quadrant2
let quadrant3
let quadrant4

window.setup = function () {

    createCanvas(windowWidth, windowHeight)
    const sceneSize = min(width, height)

    const centerX = width / 2
    const centerY = height / 2
    const objSize = sceneSize / 2
    const halfWidth = objSize / tan(60)
    const strokeW = 20

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

window.draw = function () {
    background(255)
    const sceneSize = min(width, height)

    const centerX = width / 2
    const centerY = height / 2
    const objSize = sceneSize / 2
    const halfWidth = objSize / tan(60)
    const strokeW = 20

    drawCross(centerX, centerY, objSize, strokeW)
    //drawCircle(centerX, centerY, objSize)

    dragManager.update()
    physics.update()

    fill(0)
    //noStroke()


    beginShape()
    const firstBody1 = quadrant1.bodies[0]
    vertex(firstBody1.positionX, firstBody1.positionY)

    for (const body of quadrant1.bodies) {
        curveVertex(body.positionX, body.positionY)
    }

    vertex(firstBody1.positionX, firstBody1.positionY)
    endShape()



    beginShape()
    const firstBody2 = quadrant2.bodies[0]
    vertex(firstBody2.positionX, firstBody2.positionY)

    for (const body of quadrant2.bodies) {
        curveVertex(body.positionX, body.positionY)
    }

    vertex(firstBody2.positionX, firstBody2.positionY)
    endShape()

    beginShape()
    const firstBody3 = quadrant3.bodies[0]
    vertex(firstBody3.positionX, firstBody3.positionY)

    for (const body of quadrant3.bodies) {
        curveVertex(body.positionX, body.positionY)
    }

    vertex(firstBody3.positionX, firstBody3.positionY)
    endShape()

    beginShape()
    const firstBody4 = quadrant4.bodies[0]
    vertex(firstBody4.positionX, firstBody4.positionY)

    for (const body of quadrant4.bodies) {
        curveVertex(body.positionX, body.positionY)
    }

    vertex(firstBody4.positionX, firstBody4.positionY)
    endShape()


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