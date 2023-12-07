import { VerletPhysics } from "./verletPhysics.js"
import { DragManager } from "../../shared/dragManager.js"
import { SpringNumber } from "../../shared/spring.js"
import { sendSequenceNextSignal } from "../../shared/sequenceRunner.js"



const physics = new VerletPhysics()
const dragManager = new DragManager()


let sceneSize, centerX, centerY, objSize, strokeW
let finished = false

let spring
let slingshot
let corners = []
let slingshotExists = false

let stretch, bounce1, bounce2, fall

window.preload = function () {
    stretch = loadSound("asset/stretch.wav")
    bounce1 = loadSound("asset/bounce1.wav")
    bounce2 = loadSound("asset/bounce2.wav")
    fall = loadSound("asset/fall.wav")
}

window.setup = function () {
    createCanvas(windowWidth, windowHeight)
    sceneSize = min(width, height)
    centerX = width / 2
    centerY = height / 2
    objSize = sceneSize / 2
    strokeW = 20



    for (let i = 0; i < 4; i++) {
        corners.push(new Corner(centerX, centerY, objSize / 2, i * PI / 2))
    }

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
    if (!slingshotExists) {
        setTimeout(() => {
            slingshot = new SlingShot((centerX - objSize / 2) / 2, centerY, strokeW)
            slingshotExists = true
        }, 300)
    }
}

window.draw = function () {
    background(255)

    sceneSize = min(width, height)
    centerX = width / 2
    centerY = height / 2
    objSize = sceneSize / 2
    strokeW = 20

    physics.update()
    dragManager.update()
    drawCircle()

    let outCount = 0
    corners.forEach(c => {
        c.update()
        c.display()
        if (c.out) {
            outCount++
        }
        if (outCount == 4 && !finished) {
            finished = true
            sendSequenceNextSignal()
            noLoop()
        }
    })

    if (slingshotExists) {
        slingshot.display()
        slingshot.update()

        corners.forEach(c => {
            if (c.isMe(slingshot.position.positionX, slingshot.position.positionY) && slingshot.flying) {
                c.click(structuredClone(slingshot.collisionVelocity))
            }
        })
    }
}


class SlingShot {
    constructor(x, y, size) {
        this.positionOrigin = { x, y }
        this.velocity = { x: 0, y: 0 }
        this.speed = 0.3
        this.position = physics.createBody(
            {
                positionX: x,
                positionY: y,
                isFixed: true,
                drag: 0.01,
                radius: size
            })
        dragManager.createDragObject({
            target: this.position,
            onStartDrag: o => {
                o.isFixed = true
                this.grab = true
                if (!stretch.isPlaying()) {
                    stretch.play()
                }
            },
            onStopDrag: o => {
                if (stretch.isPlaying()) {
                    stretch.stop()
                }
                this.grab = false
                o.isFixed = true
                this.flying = true
            }
        })
        this.size = size
        this.flying = false
        this.hit = false
        this.color = color(0)
        this.grab = false
    }
    display() {
        fill(this.color)
        if (!this.flying) {
            this.velocity = { x: (this.positionOrigin.x - this.position.positionX) * this.speed, y: (this.positionOrigin.y - this.position.positionY) * this.speed }
        }
        noStroke()
        circle(this.position.positionX, this.position.positionY, this.size)
    }
    update() {
        if (this.flying) {
            this.position.positionX += this.velocity.x
            this.position.positionY += this.velocity.y

            this.velocity.x *= map(this.speed, 0, 1, 0.99, 0.98)
            this.velocity.y += map(this.speed, 0, 1, 0.1, 5)

            if (this.position.positionX < this.size / 2) {
                if (!bounce2.isPlaying()) {
                    bounce2.play()
                } else {
                    bounce2.stop()
                    bounce2.play()
                }
                this.position.positionX = this.size / 2
                this.velocity.x *= map(this.speed, 0, 1, -1, -0.6)
            }
            if (this.position.positionX > width - this.size / 2) {
                if (!bounce2.isPlaying()) {
                    bounce2.play()
                } else {
                    bounce2.stop()
                    bounce2.play()
                }

                this.position.positionX = width - this.size / 2
                this.velocity.x *= map(this.speed, 0, 1, -1, -0.6)
            }
            // bounce on circle in the center of size objSize
            if (this.collideCircle()) {
                if (!bounce1.isPlaying()) {
                    bounce1.play()
                } else {
                    bounce1.stop()
                    bounce1.play()
                }
                // Calculate the vector from the circle's center to the object's position
                let dx = this.position.positionX - centerX;
                let dy = this.position.positionY - centerY;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Normalize this vector and then scale it by the circle's radius
                // This positions the object on the circle's surface
                let radius = objSize / 2
                this.position.positionX = centerX + (dx / distance) * radius;
                this.position.positionY = centerY + (dy / distance) * radius;

                // Calculate the normal at the point of collision
                let normalX = (this.position.positionX - centerX) / radius;
                let normalY = (this.position.positionY - centerY) / radius;

                // Reflect the velocity off the tangent line
                let dotProduct = this.velocity.x * normalX + this.velocity.y * normalY;
                this.velocity.x -= 2 * dotProduct * normalX;
                this.velocity.y -= 2 * dotProduct * normalY;
            }



            if (this.position.positionY > height - this.size / 2) {
                setTimeout(() => {
                    this.reset()
                }, 300)
            }
        } else if (this.grab){
            this.trajectory()
        }
    }
    trajectory() {
        let trajectory = []
        let pos = { x: this.position.positionX, y: this.position.positionY }
        let vel = { x: this.velocity.x, y: this.velocity.y }
        let acc = { x: map(this.speed, 0, 1, 0.99, 0.98), y: map(this.speed, 0, 1, 0.1, 5) }
        let dt = 0.1
        let steps = 100
        for (let i = 0; i < steps; i++) {
            pos.x += vel.x * dt + 0.5 * acc.x * dt * dt
            pos.y += vel.y * dt + 0.5 * acc.y * dt * dt
            vel.x += acc.x * dt
            vel.y += acc.y * dt
            trajectory.push({ x: pos.x, y: pos.y })
        }
        // draw trajectory
        stroke(0)
        strokeWeight(1)
        noFill()
        beginShape()
        trajectory.forEach(p => {
            vertex(p.x, p.y)
        })
        endShape()
    }

    collideCircle() {
        this.collisionVelocity = this.velocity
        return dist(this.position.positionX, this.position.positionY, centerX, centerY) < objSize / 2 - this.size
    }

    reset() {
        this.position.positionX = this.positionOrigin.x
        this.position.positionY = this.positionOrigin.y
        this.velocity = { x: 0, y: 0 }
        this.flying = false
        this.hit = false
    }
}

class Corner {
    constructor(x, y, s, angle) {
        this.position = { x, y }
        this.size = s
        this.angle = angle
        this.color = color(0)
        this.falling = false
        this.velocity = { x: 0, y: 10 }
        this.out = false
        this.fallingRotation = 0
    }
    display() {
        fill(this.color)
        noStroke()

        let a = 1.00005519
        let b = 0.55342686
        let c = 0.99873585

        let p0 = { x: 0, y: a * this.size }
        let p1 = { x: b * this.size, y: c * this.size }
        let p2 = { x: c * this.size, y: b * this.size }
        let p3 = { x: a * this.size, y: 0 }

        let corner = { x: a * this.size, y: a * this.size }
        let b1 = { x: a * this.size, y: this.size * a / 2 }

        push()
        translate(this.position.x, this.position.y)
        rotate(this.angle + this.fallingRotation)
        beginShape();
        vertex(p0.x, p0.y); // first point
        bezierVertex(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y,)
        bezierVertex(p3.x, p3.y, b1.x, b1.y, corner.x, corner.y)
        endShape(CLOSE)
        pop()
    }

    isMe(x, y) {
        let insideSquare = false
        if (this.angle == 0) {
            insideSquare = x > this.position.x && x < this.position.x + this.size && y > this.position.y && y < this.position.y + this.size
        }
        if (this.angle == PI / 2) {
            insideSquare = x < this.position.x && x > this.position.x - this.size && y > this.position.y && y < this.position.y + this.size
        }
        if (this.angle == PI) {
            insideSquare = x < this.position.x && x > this.position.x - this.size && y < this.position.y && y > this.position.y - this.size
        }
        if (this.angle == 3 * PI / 2) {
            insideSquare = x > this.position.x && x < this.position.x + this.size && y < this.position.y && y > this.position.y - this.size
        }
        return insideSquare
    }

    click(velocity) {
        this.falling = true
        if (!fall.isPlaying()) {
            fall.play()
        }
    }
    update() {
        if (this.falling && !this.out) {
            this.fallingRotation += 0.1

            if (this.position.y > height + this.size + 10) {
                this.out = true
            }

            this.velocity.y += 0.5
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y
        }
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

function drawCircle() {
    fill(0)
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