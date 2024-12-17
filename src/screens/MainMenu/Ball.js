import { TexRegion } from "@lib"
import { compositeDims } from "@utils/entity"

class Ball extends TexRegion {
    constructor() {
        super({ frame: "ball" })
        this.noOverlay = true

        this.pos.x = 0
        this.pos.y = 200
        this.anchor = {
            x: this.w / 2,
            y: this.h / 2
        }
        this.rotation = 0

        this.alpha = 1
        this.initY = this.pos.y
    }
    update(dt, t) {
        this.pos.y =this.initY + Math.cos(t * 1.25) * 60
        this.rotation += dt * Math.PI * 0.5
        this.alpha = Math.min(1, this.alpha + 0.5 * dt)
    }
}

export default Ball