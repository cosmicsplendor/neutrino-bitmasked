import { Node, TexRegion } from "@lib"
import { clamp } from "@utils/math"

class SurfaceElement extends TexRegion {
    constructor({ ...rest }) {
        super({ frame: "wtr_b", isCustom: true, ...rest })
    }
}
const MAX_AMP = 9
class Surface extends Node {
    constructor({ pos: { x, y }, numEl = 1 }) {
        super()
        const elWidth = 48, elHeight = 48
        this.numEl = numEl
        for (let i = 0; i < numEl; i++) {
            this.add(new SurfaceElement({ pos: { y, x: x + i * elWidth } }))
        }
        this.texYMax = this.children[0].frame[1] + elHeight
        this.maxHeight = elHeight
        this.yMax = y + this.maxHeight

        this.meanHeight = 24
        this.overflowHeight = this.meanHeight
        this.t = 0
        this.amp = 0
        this.period = Math.PI
    }
    set overflowHeight(val) {
        const newHeight = clamp(0, this.maxHeight, val)
        const newY = this.yMax - newHeight
        const newTexY = this.texYMax - newHeight
        for (let i = 0; i < this.numEl; i++) {
            const el = this.children[i]
            el.pos.y = newY
            el.frame[1] = newTexY
            el.frame[3] = newHeight
        }
    }
    update(dt) {
        this.t += dt
        if (this.t > this.period) {
            this.t = 0
            // this.phase += Math.PI / 15
            // this.amp = MAX_AMP * Math.sin(this.phase) // amplitude decays exponentially
        }
        this.overflowHeight = Math.round(this.meanHeight + this.amp * Math.sin(2 * this.t) * Math.sin(2 * this.t))
    }
}

export default Surface