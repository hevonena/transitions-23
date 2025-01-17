

export const VerletMode = {

    Push: "push",
    Pull: "pull",
    PushAndPull: "push_and_pull"
}

export class VerletPhysics {


    constructor() {

        this.links = []
        this.bodies = []
        this.iterations = 15
        this.gravityX = 0
        this.gravityY = 0
        this.bounds  // {left,right,top,bottom}
    }

    createChain({ startPositionX, startPositionY, endPositionX, endPositionY, elementCount, bodyOptions, linkOptions }) {

        const bodies = []
        const links = []
        for (let i = 0; i < elementCount; i++) {

            const t = map(i, 0, elementCount - 1, 0, 1)
            const x = lerp(startPositionX, endPositionX, t)
            const y = lerp(startPositionY, endPositionY, t)
            const b = this.createBody(Object.assign({}, bodyOptions, {
                positionX: x,
                positionY: y,
            }))

            bodies.push(b)

            if (i > 0) {
                const link = this.createLink(Object.assign({}, linkOptions, {
                    bodyA: bodies[i - 1],
                    bodyB: bodies[i]
                }))
                links.push(link)
            }
        }
        return {
            bodies,
            links
        }
    }

    createWaterSurface({ startPositionX, startPositionY, endPositionX, endPositionY, elementCount, bodyOptions, linkOptions }) {

        const bodies = []
        const links = []
        for (let i = 0; i < elementCount; i++) {

            const t = map(i, 0, elementCount - 1, 0, 1)
            const x = lerp(startPositionX, endPositionX, t)
            const y = lerp(startPositionY, endPositionY, t)
            let b
            if (i == 0 || i == elementCount - 1) {
                b = this.createBody(Object.assign({}, bodyOptions, {
                    positionX: x,
                    positionY: y,
                    isFixed: true
                }))
            } else {
                b = this.createBody(Object.assign({}, bodyOptions, {
                    positionX: x,
                    positionY: y,
                }))
            }

            bodies.push(b)

            if (i > 0) {
                const link = this.createLink(Object.assign({}, linkOptions, {
                    bodyA: bodies[i - 1],
                    bodyB: bodies[i]
                }))
                links.push(link)
            }
        }
        return {
            bodies,
            links
        }
    }

    createQuarter({ startPositionX, startPositionY, size, quadrant, elementCount, bodyOptions, linkOptions }) {

        const bodies = []
        const links = []

        let startX, startY, endX, endY, start2X, start2Y, end2X, end2Y, a
        if (quadrant == 1) {
            startX = startPositionX
            startY = startPositionY
            endX = startPositionX
            endY = startPositionY - size
            start2X = startPositionX + size
            start2Y = startPositionY
            end2X = startPositionX
            end2Y = startPositionY
            a = 0
        } else if (quadrant == 2) {
            startX = startPositionX
            startY = startPositionY
            endX = startPositionX - size
            endY = startPositionY
            start2X = startPositionX
            start2Y = startPositionY - size
            end2X = startPositionX
            end2Y = startPositionY
            a = - PI / 2
        } else if (quadrant == 3) {
            startX = startPositionX
            startY = startPositionY
            endX = startPositionX
            endY = startPositionY + size
            start2X = startPositionX - size
            start2Y = startPositionY
            end2X = startPositionX
            end2Y = startPositionY
            a = - PI
        } else if (quadrant == 4) {
            startX = startPositionX
            startY = startPositionY
            endX = startPositionX + size
            endY = startPositionY
            start2X = startPositionX
            start2Y = startPositionY + size
            end2X = startPositionX
            end2Y = startPositionY
            a = - PI * 3 / 2
        }
        let prevBody;
        for (let i = 0; i < floor(elementCount / 3); i++) {

            const t = map(i, 0, floor(elementCount / 3) - 1, 0, 0.99)
            const x = lerp(startX, endX, t)
            const y = lerp(startY, endY, t)
            const b = this.createBody(Object.assign({}, bodyOptions, {

                positionX: x,
                positionY: y,
            }))

            bodies.push(b)

            if (prevBody) {
                const link = this.createLink(Object.assign({}, linkOptions, {
                    bodyA: prevBody,
                    bodyB: b
                }))
                links.push(link)
            }
            prevBody = b
        }
        for (let i = 0; i < floor(elementCount / 3); i++) {

            const t = map(i, 0, floor(elementCount / 3) - 1, a - PI / 2 + 0.05, a - 0.05)
            const x = cos(t) * size + startX
            const y = sin(t) * size + startY
            const b = this.createBody(Object.assign({}, bodyOptions, {
                positionX: x,
                positionY: y,
            }))

            bodies.push(b)

            if (prevBody) {
                const link = this.createLink(Object.assign({}, linkOptions, {
                    bodyA: prevBody,
                    bodyB: b
                }))
                links.push(link)
            }
            prevBody = b
        }
        for (let i = 0; i < floor(elementCount / 3); i++) {

            const t = map(i, 0, floor(elementCount / 3) - 1, 0.01, 1)
            const x = lerp(start2X, end2X, t)
            const y = lerp(start2Y, end2Y, t)
            const b = this.createBody(Object.assign({}, bodyOptions, {

                positionX: x,
                positionY: y,
            }))

            bodies.push(b)

            if (prevBody) {
                const link = this.createLink(Object.assign({}, linkOptions, {
                    bodyA: prevBody,
                    bodyB: b
                }))
                links.push(link)
            }
            prevBody = b
        }



        //closing the chain
        const link = this.createLink(Object.assign({}, linkOptions, {
            bodyA: bodies[bodies.length - 1],
            bodyB: bodies[0]
        }))
        links.push(link)

        // add link between all bodies to all bodies
        for (let i = 0; i < bodies.length; i++) {
            for (let j = 0; j < bodies.length; j++) {
                if (i != j) {
                    if (random(1) < .2) {
                        const link = this.createLink(Object.assign({}, linkOptions, {
                            bodyA: bodies[i],
                            bodyB: bodies[j],
                            stiffness: 0.0001
                        }))
                        links.push(link)
                    }
                }
            }
        }

        console.log(this.links.length);

        return {
            bodies,
            links
        }
    }

    createLink({ bodyA, bodyB, distance, mode, stiffness }) {

        const link = {

            mode: mode || VerletMode.PushAndPull,
            bodyA: bodyA,
            bodyB: bodyB,
            stiffness: stiffness || 0.01,
            distance: distance ? distance : dist(bodyA.positionX, bodyA.positionY, bodyB.positionX, bodyB.positionY)
        }
        this.links.push(link)
        return link
    }
    destroyLink(link) {

        const id = this.links.indexOf(link)
        if (id === -1) {
            console.warn("can't destroy link", link, " because it is not part of the physics engine anymore. Possibly it was destroyed earlier.")
            return
        }
        this.links.splice(id, 1)
    }

    createBody({ positionX, positionY, drag, isFixed, radius }) {

        const body = {
            positionX: positionX ?? 0,
            positionY: positionY ?? 0,
            accelerationX: 0,
            accelerationY: 0,
            isFixed: isFixed ?? false,
            drag: drag ?? 0.5,
            radius: radius ?? 0
        }
        this.bodies.push(body)
        return body
    }
    destroyBody(body) {

        const id = this.bodies.indexOf(body)
        if (id === -1) {
            console.warn("can't destroy body", body, " because it is not part of the physics engine anymore. Possibly it was destroyed earlier.")
            return
        }
        this.bodies.splice(id, 1)
    }

    update(dt) {

        dt = Math.min(1 / 30, dt ?? deltaTime / 1000)

        const dtSqr = dt * dt
        for (const body of this.bodies) {

            let dragMulti = Math.exp(-dt * body.drag);

            if (!body.isFixed) {

                const lastPositionX = body.lastPositionX ?? body.positionX
                const lastPositionY = body.lastPositionY ?? body.positionY

                body.accelerationX += this.gravityX
                body.accelerationY += this.gravityY

                let newPosX = body.positionX + ((body.positionX - lastPositionX) * dragMulti + body.accelerationX * dtSqr);
                let newPosY = body.positionY + ((body.positionY - lastPositionY) * dragMulti + body.accelerationY * dtSqr);

                body.lastPositionX = body.positionX
                body.lastPositionY = body.positionY
                body.positionX = newPosX
                body.positionY = newPosY
            }
            else {

                body.lastPositionX = body.positionX
                body.lastPositionY = body.positionY
            }

            body.accelerationX = 0
            body.accelerationY = 0
        }

        for (let i = 0; i < this.iterations; i++) {

            for (let link of this.links) {
                if (link.bodyA.isFixed && link.bodyB.isFixed) {
                    continue
                }
                const diffX = link.bodyB.positionX - link.bodyA.positionX;
                const diffY = link.bodyB.positionY - link.bodyA.positionY;
                const distance = max(0.00001, dist(diffX, diffY, 0, 0))
                let offsetOnLine = (link.distance - distance) / distance * link.stiffness;
                if (link.mode == VerletMode.Push)
                    offsetOnLine = max(offsetOnLine, 0)
                if (link.mode == VerletMode.Pull)
                    offsetOnLine = min(offsetOnLine, 0)

                const offsetX = diffX * offsetOnLine;
                const offsetY = diffY * offsetOnLine;
                if (!link.bodyA.isFixed && !link.bodyB.isFixed) {
                    link.bodyA.positionX -= offsetX * 0.5
                    link.bodyA.positionY -= offsetY * 0.5
                    link.bodyB.positionX += offsetX * 0.5
                    link.bodyB.positionY += offsetY * 0.5
                }
                else if (link.bodyA.isFixed) {

                    link.bodyB.positionX += offsetX
                    link.bodyB.positionY += offsetY
                }
                else { // body b is fixed

                    link.bodyA.positionX -= offsetX
                    link.bodyA.positionY -= offsetY
                }
            }
        }
        if (this.bounds) {
            for (const body of this.bodies) {

                const impactFriction = 0.5
                const bounce = 0.5

                if (this.bounds.left !== undefined)
                    if (body.positionX < this.bounds.left + body.radius)
                        body.positionX = this.bounds.left + body.radius
                if (this.bounds.right !== undefined)
                    if (body.positionX > this.bounds.right - body.radius)
                        body.positionX = this.bounds.right - body.radius
                if (this.bounds.top !== undefined)
                    if (body.positionY < this.bounds.top + body.radius)
                        body.positionY = this.bounds.top + body.radius

                if (this.bounds.bottom !== undefined)
                    if (body.positionY > this.bounds.bottom - body.radius) {
                        body.positionY = this.bounds.bottom - body.radius
                        body.lastPositionY = body.positionY + (body.lastPositionY - body.positionY) * -bounce
                        body.lastPositionX = body.positionX + (body.lastPositionX - body.positionX) * impactFriction
                    }



            }

        }

    }

    displayDebug() {

        resetMatrix()

        push()
        stroke(0, 0, 255, 128)
        strokeWeight(2)
        noFill()
        for (const link of this.links) {

            line(link.bodyA.positionX, link.bodyA.positionY, link.bodyB.positionX, link.bodyB.positionY)
        }
        noStroke()
        fill(0, 0, 255, 255)
        for (const body of this.bodies) {

            circle(body.positionX, body.positionY, 8)
        }
        pop()
    }

    addForce(body, x, y) {

        body.accelerationX += x ?? 0
        body.accelerationY += y ?? 0
    }
}