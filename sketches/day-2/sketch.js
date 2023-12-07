import { sendSequenceNextSignal } from "../../shared/sequenceRunner.js"

let sceneSize, centerX, centerY, objSize, strokeW
let fortune = []
let finished = false

let bone
let crack

window.preload = function () {
    bone = loadSound("asset/bone.mp3")
    crack = loadSound("asset/crack.wav")
    crack.setVolume(0.1)
}

window.setup = function () {
    createCanvas(windowWidth, windowHeight)
    sceneSize = min(width, height)
    centerX = width / 2
    centerY = height / 2
    objSize = sceneSize / 2
    strokeW = 20

    fortune.push(new Fortune(centerX, centerY, 4, objSize, strokeW))
}

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight)
}

window.mouseClicked = function () {
    fortune.forEach(f => {
        f.open(mouseX, mouseY)
    })
}

window.draw = function () {
    background(255)

    sceneSize = min(width, height)
    centerX = width / 2
    centerY = height / 2
    objSize = sceneSize / 2
    strokeW = 20

    //drawCross(centerX, centerY, objSize, strokeW)

    fortune.forEach(f => {
        f.update()
        f.display()
    })
}


import { SpringNumber } from "../../shared/spring.js"

class Fortune {
    constructor(centerX, centerY, n, objSize, strokeW) {
        this.p = []
        this.pc = []
        this.springs = []
        this.endP = []
        this.corners = []
        this.finalCorners = []
        for (let i = 0; i < n; i++) {
            this.p.push({ x: centerX + cos(i * TWO_PI / n) * objSize / 2, y: centerY - sin(i * TWO_PI / n) * objSize / 2 })
            this.corners.push({ x: centerX + cos(i * TWO_PI / n) * objSize / 2, y: centerY - sin(i * TWO_PI / n) * objSize / 2 })
            this.finalCorners.push({ x: centerX + cos(i * TWO_PI / n) * objSize, y: centerY - sin(i * TWO_PI / n) * objSize })
            this.pc.push({ x: centerX, y: centerY })
            this.springs.push(new SpringNumber({
                position: 0, // start position
                frequency: 4.5, // oscillations per second (approximate)
                halfLife: 0.15 // time until amplitude is halved
            }))
            this.endP.push({ x: centerX + cos((i + 0.5) * TWO_PI / n) * objSize / 4, y: centerY + sin((i + 0.5) * TWO_PI / n) * objSize / 4 })
        }
        this.center = { x: centerX, y: centerY }
        this.size = objSize
        this.strokeW = strokeW
        this.alpha = 255
        this.isOpen = false
        this.strokeDots = 20
    }

    open(x, y) {
        if (dist(x, y, this.center.x, this.center.y) > this.size) return null

        let c = 0
        this.springs.forEach(s => {
            if (s.position > 0.99) c++
        })
        c === 4 ? this.isOpen = true : this.isOpen = false

        if (!this.isOpen) {
            let i = this.determinePosition(this.center.x, this.center.y, x, y)

            switch (i) {
                case 1:
                    //Up Left
                    if (bone.isPlaying()) {
                        bone.stop()
                        bone.play()
                    } else {
                        bone.play()
                    }
                    this.springs[2].target = 1
                    break
                case 2:
                    //Bottom Left
                    if (bone.isPlaying()) {
                        bone.stop()
                        bone.play()
                    } else {
                        bone.play()
                    }
                    this.springs[1].target = 1

                    break
                case 3:
                    //Bottom Right
                    if (bone.isPlaying()) {
                        bone.stop()
                        bone.play()
                    } else {
                        bone.play()
                    }
                    this.springs[0].target = 1
                    break
                case 4:
                    //Up Right
                    if (bone.isPlaying()) {
                        bone.stop()
                        bone.play()
                    } else {
                        bone.play()
                    }
                    this.springs[3].target = 1
                    break
            }
        } else {
            if (dist(x, y, this.center.x, this.center.y) < this.size / 2) {
                this.springs.forEach(s => {
                    s.target += 0.5
                    crack.play()
                    setTimeout(() => {
                        s.target = 1.2
                    }, 100)
                    crack.onended(() => {
                        if (!finished) {
                            finished = true
                            sendSequenceNextSignal()
                        }
                    })
                })

            }
        }
    }
    update() {
        !this.isOpen ? this.update1() : this.update2()
    }


    update1() {
        this.springs.forEach((s) => {
            s.step(deltaTime / 1000)
        })

        this.pc.forEach((p, i) => {
            p.x = lerp(this.center.x, this.endP[3 - i].x, this.springs[3 - i].position)
            p.y = lerp(this.center.y, this.endP[3 - i].y, this.springs[3 - i].position)
        })
    }

    update2() {
        this.springs.forEach((s) => {
            s.step(deltaTime / 1500)
        })

        this.pc.forEach((p, i) => {
            p.x = lerp(this.center.x, this.endP[3 - i].x, this.springs[3 - i].position * 4 - 1)
            p.y = lerp(this.center.y, this.endP[3 - i].y, this.springs[3 - i].position * 4 - 1)
        })

        this.p.forEach((p, i) => {
            p.x = lerp(this.corners[i].x, this.finalCorners[i].x, this.springs[i].position - 1)
            p.y = lerp(this.corners[i].y, this.finalCorners[i].y, this.springs[i].position - 1)
        })
        //this.strokeW = map(this.springs[0].position, 1, 1.2, 20, 0)
        this.strokeW > 0 ? this.strokeW -= 0.7 : this.strokeW = 0
        this.strokeDots = map(this.springs[0].position, 1, 1.2, 18, 20)
    }

    display() {
        !this.isOpen ? this.display1() : this.display2()
    }

    display1() {
        drawingContext.save()
        fill(255, 0, 0)
        noStroke()
        beginShape()
        this.p.forEach((p, i) => {
            vertex(p.x, p.y)
            vertex(this.pc[i].x, this.pc[i].y)
        })
        endShape(CLOSE)
        drawingContext.clip()

        fill(255)
        rect(0, 0, width, height)
        drawGrid(this.strokeDots)
        drawingContext.restore()


        noFill()
        stroke(0)
        strokeWeight(this.strokeW)
        beginShape()
        this.p.forEach((p, i) => {
            vertex(p.x, p.y)
            vertex(this.pc[i].x, this.pc[i].y)
            circle(p.x, p.y, 0)
        })
        endShape(CLOSE)

    }

    display2() {
        drawingContext.save()
        fill(255, 0, 0)
        noStroke()
        beginShape()
        this.p.forEach((p, i) => {
            vertex(p.x, p.y)
            vertex(this.pc[i].x, this.pc[i].y)
        })
        endShape(CLOSE)
        drawingContext.clip()

        fill(255)
        rect(0, 0, width, height)
        drawGrid(this.strokeDots)
        drawingContext.restore()


        noFill()
        stroke(0)
        strokeWeight(this.strokeW)
        beginShape()
        this.p.forEach((p, i) => {
            vertex(p.x, p.y)
            vertex(this.pc[i].x, this.pc[i].y)
            circle(p.x, p.y, 0)
        })
        endShape(CLOSE)

    }

    determinePosition(x1, y1, x2, y2) {
        if (x2 > x1) {
            if (y2 < y1) {
                return 4; // Up Right
            } else {
                return 3; // Bottom Right
            }
        } else {
            if (y2 > y1) {
                return 2; // Bottom Left
            } else {
                return 1; // Up Left
            }
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

function drawCircle(x, y, size) {
    fill(0)
    noStroke()
    circle(x, y, size)
}

function drawGrid(strokeW) {
    fill(0)
    noStroke()
    const gridCount = 5
    const pointSize = strokeW

    for (let x = 0; x < gridCount; x++) {
        for (let y = 0; y < gridCount; y++) {
            const xPos = map(x, 0, gridCount - 1, centerX - objSize / 2, centerX + objSize / 2, x)
            const yPos = map(y, 0, gridCount - 1, centerY - objSize / 2, centerY + objSize / 2, y)
            circle(xPos, yPos, pointSize)
        }
    }
}

