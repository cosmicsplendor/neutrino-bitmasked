import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import MovableEnt from "./MovableEnt"
import { fadeSound } from "@lib/utils"

const ANG_VEL = Math.PI
class SawBlade extends MovableEnt {
    overlay=[0.7,0.7,0.7]
    constructor(x, y, frame, toX=x, toY=y, speed=100, player, soundSprite) {
        super(x, y, frame, toX, toY, speed)
        this.anchor = {
            x: this.width / 2,
            y: this.height / 2
        }
        this.player = player
        this.radius = this.width / 2
        const shrinkBy = 10 * this.radius / 48
        this.hitCirc = { x: shrinkBy, y: shrinkBy, radius: this.radius - shrinkBy }
        this.rotation = 0
        this.testCol = getTestFn(this, player)
        if (this.velX || this.velY) { 
            this.forceUpd = true
            this.sound = soundSprite.create("saw_norm")
        } else {
            this.sound = soundSprite.create("saw1")
        }
    }
    update(dt) {
        const dRot = (this.velX  - this.velY) * dt / (2 * this.radius)
        super.update(dt)
        fadeSound(this.sound, 144000, this)
        this.rotation += dRot || ANG_VEL * dt
        if (this.testCol(this, this.player)) {
            this.player.visible && this.player.explode()
        }
    }
    reset() {
        this.sound.pause()
    }
}

export default SawBlade