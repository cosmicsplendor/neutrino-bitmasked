import { TexRegion } from "@lib"
import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import { easingFns } from "@utils/math"

class Bus extends TexRegion {
    hitbox = {
        x: 2,
        y: 0,
        width: 86,
        height: 88
    }
    forceUpd = true
    noOverlay=true
    smooth=true
    constructor({x, y, toX, toY, period, flip, player}) { // spawn points for movable collidable entities have to be on midground layer (on tiled layer should be set to mg)
        super({ pos: { x, y }, frame: "crane" })
        this.prevPosY = this.pos.y
        this.prevPosX = this.pos.x
        this.mat = "metal"
        this.movable = true

        this.dispY = toY - y
        this.meanY = y

        this.dispX = toX - x
        this.meanX = x

        this.period = period
        this.t = 0

        this.moveY = this.dispY !== 0

        this.player = player
        this.testCol = getTestFn(this, player)
        if (flip) {
            this.scale = { x: -1, y: 1 }
            this.pos.x += 88
            this.hitbox.x -= 88
        }
    }
    update(dt) {
        this.t += dt
        if (this.moveY) {
            this.updateY(dt)
            return
        }
        this.updateX(dt)
    }
    updateY(dt) {
        this.pos.y = this.meanY + easingFns.smoothstep(this.t / this.period) * this.dispY
        if (this.t > this.period) {
            this.meanY = this.meanY + this.dispY
            this.pos.y = this.meanY
            this.dispY *= -1
            this.t = 0
        }
        this.velY = (this.pos.y - this.prevPosY) / dt
    }
    updateX(dt) {
        this.pos.x = this.meanX + easingFns.linear(this.t / this.period) * this.dispX
        if (this.t > this.period) {
            this.meanX = this.meanX + this.dispX
            this.pos.x = this.meanX
            this.dispX *= -1
            this.t = 0
        }
        const dx = this.pos.x - this.prevPosX
        if (this.player.pos.y === this.pos.y - 64 && this.player.pos.x < this.pos.x + 88 && this.player.pos.x > this.pos.x - 32) {
            this.player.pos.x += dx
        }
        this.velX = dx / dt
    }
}

export default Bus