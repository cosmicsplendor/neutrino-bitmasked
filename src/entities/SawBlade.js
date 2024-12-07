import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import MovableEnt from "./MovableEnt"

const ANG_VEL = Math.PI
class SawBlade extends MovableEnt {
    noOverlay = true
    constructor(x, y, frame, toX=x, toY=y, speed=100, player) {
        super(x, y, frame, toX, toY, speed)
        this.anchor = {
            x: this.width / 2,
            y: this.height / 2
        }
        this.player = player
        this.radius = this.width / 2
        this.hitCirc = this.hitCirc ?? { x: 0, y: 0, radius: this.radius - 2 }
        this.rotation = 0
        this.testCol = getTestFn(this, player)
        if (this.velX || this.velY) { this.forceUpdate = true }
    }
    update(dt) {
        const dRot = (this.velX  - this.velY) * dt / (2 * this.radius)
        super.update(dt)
        this.rotation += dRot || ANG_VEL * dt
        if (this.testCol(this, this.player)) {
            this.player.visible && this.player.explode()
        }
    }
}

export default SawBlade