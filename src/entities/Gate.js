import TexRegion from "@lib/entities/TexRegion"
import { clamp, sign, easingFns } from "@utils/math"
import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import { sqDist } from "@lib/utils/math"
const hitbox = Object.freeze({ x: 9, y: 0, width: 93, height: 200 })
class Gate extends TexRegion {
    overlay = [0.65,0.65,0.65]
    forceUpd = true
    constructor({ endY, uSound, dSound, speed=150, pos, player, ...rest }) {
        super({ frame: "gate", pos, ...rest })
        this.endY = endY
        this.startY = pos.y
        this.initDir = sign(this.endY - this.startY)
        this.dir = this.initDir
        this.dist = Math.abs(this.endY - this.startY)
        this.period = this.dist / speed
        this.t = 0
        this.uSound = uSound
        this.dSound = dSound
        this.player = player
        this.testCol = getTestFn(this, player)
        this.hitbox = hitbox
    }
    updatePos(dt) {
        this.t += dt
        const dp = this.dist * easingFns.cubicIn(this.t / this.period)
        this.pos.y = (this.dir === this.initDir ? this.startY: this.endY) + dp * this.dir
        const newPosY = this.startToEndDir === 1 ? clamp(this.startY, this.endY, this.pos.y): clamp(this.endY, this.startY, this.pos.y)
        if (newPosY !== this.pos.y) { // if the gate has gone beyond extremes
            this.t = 0
            this.dir *= -1
            this.pos.y = newPosY
            const dist = sqDist(this.pos, this.player.pos)
            if (dist > 160000) return // if the distance is greater than 400px return
            const volume = 1 - dist / 160000
            if (this.dir === 1) { // just collided with ceiling
                return this.uSound.play(volume)
            }
            this.dSound.play(volume)
        }
    }
    reset() {
        this.pos.Y = this.startY
        this.velY = this.velY0
    }
    update(dt) {
        this.updatePos(dt)  
        if (this.testCol(this, this.player)) {
            this.player.visible && this.player.explode()
        }
    }
}

export default Gate