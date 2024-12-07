import { Node, TexRegion } from "@lib"
import config from "@config"
import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import { randf, rand, easingFns, sqLen } from "@utils/math"

const PI = Math.PI
const period = [ 1.5, 2 ]
const amp = [ 16, 36 ]
const height = [ 180, 180 ] 
const swirlOffset = [ 0, PI]
class WindParticle extends TexRegion {
    forceUpdate = true
    constructor() {
        super({ frame: "wind" })
        this.period = randf(period[0], period[1])
        this.amp = rand(amp[0], amp[1])
        this.height = rand(height[0], height[1])
        this.swirlOffset = randf(swirlOffset[0], swirlOffset[1])

        this.t = 0
    }
    update(dt) {
        this.t += dt
        const norm = this.t / this.period
        this.pos.y = - this.height * easingFns.linear(norm)
        this.pos.x = this.amp * Math.sin(this.swirlOffset + 4 * PI * norm)
        this.alpha = 1 - easingFns.quadOut(norm)
        if (norm > 1) {
            this.t = 0
        }
    }
}

class Wind extends Node {
    constructor(data, x, y, player) {
        super(data)
        // this.rotation = -Math.PI / 2
        this.pos.x = x - 6
        this.pos.y = y - 9
        this.player = player
        // this.sound = sound
        this.hitbox = { x: -25, y: -200, width: 50, height: 200}
        this.testCol = getTestFn(this, player)


        for (let i = 0; i < 60; i++) {
            this.add(new WindParticle())
        }
        this.feed(240, 1 / 60)
    }
    feed(iterations, dt) {
        for (let i = iterations - 1; i > -1; i--) {
            for (let j = this.children.length - 1; j > -1; j--) {
                this.children[j].update(dt)
            }
        }
    }
    update(dt) {
        if (this.testCol(this, this.player) && this.player.visible) {
            const dPosX = this.player.pos.x + this.player.width / 2 - this.pos.x
            const dPosY = this.player.pos.y + this.player.width / 2 - this.pos.y
            const sqDist = sqLen(dPosX, dPosY)
            if (sqDist < 4096) { return }
            this.player.controls.switchState("jumping", this.player)
            this.player.velY -= config.gravity * (sqDist / 32400) * dt
        }
    }
    reset() { }
    onRemove() {
        this.parent = null
    }
}

export default Wind