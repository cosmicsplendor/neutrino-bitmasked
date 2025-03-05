import getTestFn from "@lib/components/Collision/helpers/getTestFn";

const { TexRegion } = require("@lib/index");

class Lever extends TexRegion {
    forceUpdate = true
    constructor(x, y, path="pend", period=1) {
      super({ frame: "lever", pos: { x, y } })
      this.anchor = { x: 12, y: 14 }
      this.rotation = 0
      this.path = path
      this.period = period
      this.elapsedTime = 0
  
      if (this.path === "circular") {
        // Circular path: complete one full revolution in the given period.
        this.update = dt => {
          this.rotation = (this.rotation + dt * (2 * Math.PI / this.period)) % (2 * Math.PI)
        }
      } else if (this.path.startsWith("pend")) {
        // Pendulum variants.
        // Default amplitude: Math.PI * 0.25 (i.e. ±45°).
        let amplitude = Math.PI * 0.33
        let offset = 0
  
        // Set the rotation offset based on variant.
        if (this.path === "pend") {
          // Center oscillation at 90°.
          offset = Math.PI * 0.5
        } else if (this.path === "pend-l") {
          // Center oscillation at 180°.
          offset = Math.PI
        } else if (this.path === "pend-r") {
          // No offset; oscillate symmetrically around 0.
          offset = 0
        }
  
        this.update = dt => {
          this.elapsedTime += dt
          // Oscillate with cosine over the given period.
          this.rotation = offset + amplitude * Math.cos((2 * Math.PI * this.elapsedTime) / this.period)
        }
      }
    }
  }
  
class Blade extends TexRegion {
    forceUpdate = true
    hitCirc = {
        x: 2, y: 2, radius: 46
    }
    constructor(lever, length, player) {
        super({ frame: "sb7" })
        this.lever = lever
        this.length = length
        this.player = player
        this.syncPos()
        this.testCol = getTestFn(this, player)
    }
    syncPos() {
        const { lever, length } = this
        this.pos.x = lever.pos.x + lever.anchor.x + length * Math.cos(lever.rotation) - 48,
            this.pos.y = lever.pos.y + lever.anchor.y + length * Math.sin(lever.rotation) - 48
    }
    update() {
        this.syncPos()
        if (this.testCol(this, this.player)) {
            this.player.explode()
        }
    }
}
class LeverSaw extends TexRegion {
    noOverlay = true
    forceUpdate = true
    constructor({ x, y, length = 36, player, path, period }) {
        super({ frame: "plug", pos: { x, y } })
        const lever = new Lever(28, 16, path, period)
        const blade = new Blade(lever, length, player)
        this.add(lever)
        this.add(blade)
    }
}

export default LeverSaw