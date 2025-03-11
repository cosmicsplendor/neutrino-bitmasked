import getTestFn from "@lib/components/Collision/helpers/getTestFn";
import { pickOne, randf, sqDist } from "@lib/utils/math";

const { TexRegion } = require("@lib/index");

class Lever extends TexRegion {
    forceUpd = true
    constructor(x, y, playSound, path="pend", period=1) {
      super({ frame: "lever", pos: { x, y } })
      this.anchor = { x: 12, y: 14 }
      this.rotation = 0
      this.path = path
      this.period = period
      this.elapsedTime = 0
  
      if (this.path === "circ") {
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
        this.phaseChecked = {0: false, [Math.PI]: false}
        this.update = dt => {
          // Update elapsed time
          this.elapsedTime += dt
          
          // Calculate phase (0 to 2π) and normalize it
          const phase = ((2 * Math.PI * this.elapsedTime) / this.period) % (2 * Math.PI)
          
          // Calculate rotation
          this.rotation = offset + amplitude * Math.cos(phase)
          
          // The pendulum changes direction at phase = 0 and phase = π
          // Set a tolerance to handle variable frame rates
          const tolerance = 0.2
          
          // Check for phase near 0 (cos = 1, max position)
          if (phase < tolerance || phase > (2 * Math.PI - tolerance)) {
            if (!this.phaseChecked[0]) {
              playSound()
              this.phaseChecked[0] = true
              this.phaseChecked[Math.PI] = false
            }
          }
          
          // Check for phase near π (cos = -1, min position)
          else if (Math.abs(phase - Math.PI) < tolerance) {
            if (!this.phaseChecked[Math.PI]) {
              playSound()
              this.phaseChecked[Math.PI] = true
              this.phaseChecked[0] = false
            }
          }
        }
      }
    }
  }
  
class Blade extends TexRegion {
    forceUpd = true
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
        const { lever } = this
        const length = this.length || 220
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
    forceRen = true
    constructor({ x, y, length = 36, player, path, period, soundSprite }) {
        super({ frame: "plug", pos: { x, y } })
        const sliceSFX = soundSprite.create("slice1")
        const squeaks = ["squeak2", "squeak1"].map(name => soundSprite.create(name))
        const playSound = () => {
          const dist = sqDist(player.pos, this.pos)
          if (dist > 120000) return
          const volume = 1 - dist / 120000
          pickOne(squeaks).play(0.5 * volume)
          sliceSFX.play(0.25 * volume)
        }
        const lever = new Lever(28, 16, path === "circ" ? null: playSound, path, period)
        const blade = new Blade(lever, length, player)
        this.add(lever)
        this.add(blade)
    }
}

export default LeverSaw