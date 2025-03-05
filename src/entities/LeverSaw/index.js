const { TexRegion } = require("@lib/index");

class Lever extends TexRegion {
    forceUpdate = true
    constructor(x, y, path="pendulum", period=2, amplitude = Math.PI / 4) {
      super({ frame: "lever", pos: { x, y } })
      this.anchor = { x: 12, y: 14 }
      this.rotation = 0
      this.path = path
      this.period = period
      this.elapsedTime = 0
  
      if (this.path === "circular") {
        // For a circular path, the lever should complete a full rotation (2π) in the given period.
        // We define update to add the corresponding angular change each frame.
        this.update = dt => {
          // Calculate angular increment: (2π / period) radians per second.
          this.rotation = (this.rotation + dt * (2 * Math.PI / this.period)) % (2 * Math.PI)
        }
      } else if (this.path === "pendulum") {
        // For a pendulum, we simulate oscillation using a cosine wave.
        // elapsedTime tracks total time to compute the phase.
        // The lever oscillates between -amplitude and +amplitude.
        this.amplitude = amplitude
        this.update = dt => {
          this.elapsedTime += dt
          this.rotation = this.amplitude * Math.cos((2 * Math.PI * this.elapsedTime) / this.period)
        }
      }
    }
  }
class Blade extends TexRegion {
    forceUpdate=true
    constructor(lever, length, player) {
        super({ frame: "sb7"})
        this.lever = lever
        this.length = length
        this.player = player
        this.syncPos()
    }
    syncPos() {
        const { lever, length } = this
        this.pos.x = lever.pos.x + lever.anchor.x + length * Math.cos(lever.rotation) - 48,
        this.pos.y = lever.pos.y + lever.anchor.y + length * Math.sin(lever.rotation) - 48
    }
    update() {
        this.syncPos()
    }
}
class LeverSaw extends TexRegion {
    noOverlay=true
    forceUpdate=true
    constructor({ x, y, length=36, player, path, period }) {
        super({ frame: "plug", pos: { x, y } })
        const lever = new Lever(28, 16, path, period)
        const blade = new Blade(lever, length, player)
        this.add(lever)
        this.add(blade)
    }
}

export default LeverSaw