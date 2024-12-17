import { TexRegion } from "@lib"

class Ball extends TexRegion {
    constructor() {
        super({ frame: "ball" })
        this.noOverlay = true
        this.alpha = 0
    }
    update(dt, t) {
        this.alpha = Math.min(1, this.alpha + 0.25 * dt)
    }
}

export default Ball