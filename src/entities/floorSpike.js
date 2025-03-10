import TexRegion from "@lib/entities/TexRegion"
import { clamp, easingFns } from "@utils/math"
import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import { sqDist } from "@lib/utils/math"
class FloorSpike extends TexRegion {
    overlay = [0.6, 0.6, 0.6]
    constructor({ soundSprite, pos, player, delay = 0, period = .4, ...rest }) {
        super({ frame: "spike", pos, ...rest })
        this.endY = pos.y + 40
        this.startY = pos.y
        this.initDir = 1
        this.dir = this.initDir
        this.dist = 44
        this.period = period
        this.t = -delay
        this.sound = soundSprite.create("spike")
        this.player = player
        this.hitbox = { x: 6, y: 15, width: 68, height: 25 }
        this.testCol = getTestFn(this, player)
    }
    updatePos(dt) {
        this.t += dt
        if (this.t < 0) return
        
        const dp = this.dist * easingFns.bounceOut(this.t / this.period)
        const calculatedY = (this.dir === this.initDir ? this.startY : this.endY) + dp * this.dir
        
        // Clamp the position before setting it
        const newPosY = clamp(this.startY, this.endY, calculatedY)
        this.pos.y = newPosY
        
        // Check if we've reached the bounds and need to reverse
        if ((this.dir === 1 && calculatedY > this.endY) || 
            (this.dir === -1 && calculatedY < this.startY)) {
            // This preserves the original timing mechanism
            this.t = this.dir === 1 ? -1.75 : -1.25  // Negative time creates the delay
            this.dir *= -1
            
            const dist = sqDist(this.pos, this.player.pos)
            if (dist <= 120000) {
                this.sound.volume = 1 - dist/120000
                this.sound.play()
            }
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

export default FloorSpike