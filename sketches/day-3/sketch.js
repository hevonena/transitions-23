import { VerletPhysics } from "./verletPhysics.js"
import { DragManager } from "../../shared/dragManager.js"
import { SpringNumber } from "../../shared/spring.js"
import { sendSequenceNextSignal } from "../../shared/sequenceRunner.js"


const physics = new VerletPhysics()
const dragManager = new DragManager()


let sceneSize, centerX, centerY, objSize, strokeW
let finished = false

let spring
let gridPoints = []
let waterSurface
let level = 0
let plouf
let win
let played = false

window.preload = function () {
    plouf = loadSound("asset/plouf.wav")
    win = loadSound("asset/win.mp3")
}

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

    waterSurface = physics.createWaterSurface({
        startPositionX: centerX - objSize / 2,
        startPositionY: centerY + objSize / 2,
        endPositionX: centerX + objSize / 2,
        endPositionY: centerY + objSize / 2,
        elementCount: 50,
        linkOptions: {
            //mode: VerletMode.Pull,
            stiffness: 0.5
        },
        bodyOptions: {
            drag: 0.2,
            radius: strokeW / 2,
        }
    })

    for (let i = 1; i < waterSurface.bodies.length - 1; i++) {
        dragManager.createDragObject({
            target: waterSurface.bodies[i],
            onStartDrag: o => {
                o.isFixed = true
            },
            onStopDrag: o => {
                o.isFixed = false
            }
        })
    }

    initGrid()
}

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight)
}

window.mouseClicked = function () {
    gridPoints.forEach(p => {
        if (p.isMe(mouseX, mouseY) && !p.falling) {
            p.click()
        }
    })
}

window.draw = function () {
    let cursorType = ARROW
    gridPoints.forEach(p => {
    
        if (p.isMe(mouseX, mouseY)) {
            cursorType = HAND
        }
        
    })
    cursor(cursorType)

    background(255)


    sceneSize = min(width, height)
    centerX = width / 2
    centerY = height / 2
    objSize = sceneSize / 2
    strokeW = 20

    physics.bounds = {
        left: centerX - objSize / 2 - strokeW / 2,
        right: centerX + objSize / 2 + strokeW / 2,
        top: centerY - objSize / 2 - strokeW / 2,
        bottom: centerY + objSize / 2 + strokeW / 2
    }

    dragManager.update()
    physics.update()

    //debugWaterSurface()

    flatness() && level == 25 ? finished = true : null
    if (finished && !win.isPlaying() && !played) {
        played = true
        win.play()
        win.onended(() => {
            sendSequenceNextSignal()
            noLoop()
        })
    }

    gridPoints.forEach(p => {
        if (level == 0) {
            if (p.position.y > centerY + objSize / 2) {
                p.fell = true
                raiseWaterSurface()
                if (!plouf.isPlaying()) {
                    plouf.play()
                }
            }
        } else {
            if (belowWaterSurface(p.position.x, p.position.y) && !p.fell) {
                raiseWaterSurface()

                p.fell = true
                drop(p.position.x, p.position.y, p)
                p.falling = false

                if (!plouf.isPlaying()) {
                    plouf.play()
                } else {
                    plouf.stop()
                    plouf.play()
                }
            }
        }
    })

    drawGrid()
    updateWaterSurface()
    if (level > 0) {
        drawWaterSurface()
    }
    if (finished) {
        drawSquare()
    }
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

function drawWaterSurface() {
    const bottomLeft = { x: centerX - objSize / 2, y: centerY + objSize / 2 }
    const bottomRight = { x: centerX + objSize / 2, y: centerY + objSize / 2 }
    const topLeft = { x: centerX - objSize / 2, y: centerY - objSize / 2 }
    const topRight = { x: centerX + objSize / 2, y: centerY - objSize / 2 }
    fill(0)
    stroke(0)
    //strokeWeight(strokeW)
    beginShape()
    vertex(bottomLeft.x, bottomLeft.y)
    for (const body of waterSurface.bodies) {
        vertex(body.positionX, body.positionY)
    }
    vertex(bottomRight.x, bottomRight.y)
    endShape(CLOSE)

}

function updateWaterSurface() {
    spring.target = ease(map(level, 0, 25, 0, 1))
    spring.step(deltaTime / 1000)
    const bottomLeft = { x: centerX - objSize / 2, y: centerY + objSize / 2 }
    const bottomRight = { x: centerX + objSize / 2, y: centerY + objSize / 2 }
    const topLeft = { x: centerX - objSize / 2, y: centerY - objSize / 2 }
    const topRight = { x: centerX + objSize / 2, y: centerY - objSize / 2 }

    waterSurface.bodies[0].positionY = lerp(bottomLeft.y, topLeft.y, spring.position)
    waterSurface.bodies[waterSurface.bodies.length - 1].positionY = lerp(bottomRight.y, topRight.y, spring.position)
}

function belowWaterSurface(x, y) {

    for (let i = 0; i < waterSurface.bodies.length - 1; i++) {
        const body1 = waterSurface.bodies[i]
        const body2 = waterSurface.bodies[i + 1]

        // Check if x is between the x-coordinates of the two bodies
        if ((body1.positionX <= x && x <= body2.positionX) || (body2.positionX <= x && x <= body1.positionX)) {
            // Calculate the y-coordinate of the water surface at x
            const slope = (body2.positionY - body1.positionY) / (body2.positionX - body1.positionX)
            const yAtX = slope * (x - body1.positionX) + body1.positionY
            // Check if the given y is below the y-coordinate of the water surface at x
            if (y > yAtX - strokeW / 2) {
                return true
            }
        }
    }
    return false
}




function raiseWaterSurface() {
    level++
}

function flatness() {
    let threshold = 0.1
    let diff = 0
    for (let i = 0; i < waterSurface.bodies.length - 1; i++) {
        const body1 = waterSurface.bodies[i]
        const body2 = waterSurface.bodies[i + 1]

        diff += abs(body1.positionY - body2.positionY)
    }
    diff /= waterSurface.bodies.length
    return diff < threshold
}

function drop(x, y, p) {
    if (!p.drop) {
        let minDist = Infinity
        let closestPoint = null
        waterSurface.bodies.forEach(body => {
            let d = dist(x, y, body.positionX, body.positionY)
            if (d < minDist) {
                minDist = d
                closestPoint = body
            }
        })
        closestPoint.positionY += 25
    }
}

function debugWaterSurface() {
    waterSurface.bodies.forEach((body, i) => {
        fill(255, 0, 0)
        noStroke()
        circle(body.positionX, body.positionY, strokeW)
        fill(0)
        noStroke()
        text(i, body.positionX, body.positionY)
    })
}

function drawCircle(x, y, size) {
    fill(0)
    noStroke()
    circle(x, y, size)
}

function drawGrid() {
    fill(0)
    noStroke()
    gridPoints.forEach(p => {
        if (!p.fell) {
            p.fall()
            p.draw()
        }
    })
}

function initGrid() {
    const gridCount = 5
    const pointSize = strokeW

    for (let x = 0; x < gridCount; x++) {
        for (let y = 0; y < gridCount; y++) {
            const xPos = map(x, 0, gridCount - 1, centerX - objSize / 2, centerX + objSize / 2, x)
            const yPos = map(y, 0, gridCount - 1, centerY - objSize / 2, centerY + objSize / 2, y)
            gridPoints.push(new gridPoint(xPos, yPos, pointSize))
        }
    }
}

function drawSquare() {
    fill(0)
    noStroke()
    rectMode(CENTER)
    rect(centerX, centerY, objSize, objSize)
}

function ease(x) {
    return x * x;
}

class gridPoint {
    constructor(x, y, size) {
        this.position = { x, y }
        //this.velocity = { x: map(x, centerX - objSize / 2, centerX + objSize / 2, 7, -7), y: -5 }
        this.velocity = { x: random(-10, 10), y: random(-2, - 10) }
        this.size = size
        this.color = color(0)
        this.falling = false
        this.fell = false
        this.drop = false
    }
    draw() {
        fill(this.color)
        noStroke()
        circle(this.position.x, this.position.y, this.size)
    }
    isMe(x, y) {
        return dist(x, y, this.position.x, this.position.y) < this.size / 2
    }
    click() {
        this.falling = true
    }
    changeColor() {
        this.color = color(255)
    }
    fall() {
        if (this.falling) {
            this.velocity.y += 0.5
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y
            // bounds
            if (this.position.x < centerX - objSize / 2) {
                this.position.x = centerX - objSize / 2
                this.velocity.x *= -1
            }
            if (this.position.x > centerX + objSize / 2) {
                this.position.x = centerX + objSize / 2
                this.velocity.x *= -1
            }
            if (this.fell && !this.drop) {
                this.drop = true
                drop(this.position.x, this.position.y)
            }
            // if (this.position.y < centerY - objSize / 2) {
            //     this.position.y = centerY - objSize / 2
            //     this.velocity.y *= -1
            // }
        }
    }
}

