import { Node, TexRegion } from "@lib"
import config from "@config"
import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import { randf, rand, easingFns, sqDist } from "@utils/math"

const PI = Math.PI
const period = [ 3, 4 ]
const amp = [ 16, 36 ]
const height = [ 180, 180 ] 
const swirlOffset = [ 0, PI]
class WindParticle extends TexRegion {
    noOverlay=true
    forceUpd = true
    constructor() {
        super({ frame: "wind" })
        this.period = randf(period[0], period[1])
        this.amp = rand(amp[0], amp[1])
        this.height = rand(height[0], height[1])
        this.swirlOffset = randf(swirlOffset[0], swirlOffset[1])
        this.initAlpha = 0.75
        this.t = 0
        if (Math.random() < 0.5) {
            const scale = 1.125
            this.scale = { x: scale, y: scale }
        } else {
            this.scale = { x: 0.75 + Math.random() * 0.5, y: 0.75 + Math.random() * 0.5 }
        }
    }
    update(dt) {
        this.t += dt
        const norm = this.t / this.period
        this.pos.y = - this.height * easingFns.linear(norm)
        this.pos.x = this.amp * Math.sin(this.swirlOffset + 4 * PI * norm)
        this.alpha = (1 - easingFns.quadOut(norm)) * 0.4
        if (norm > 1) {
            this.t = 0
        }
    }
}

class Wind extends Node {
    overlay=[1, 1, 1]
    constructor(data, x, y, sound, player) {
        super(data)
        this.pos.x = x - 6
        this.pos.y = y - 9
        this.player = player
        // Define wind tunnel boundaries
        this.hitbox = { x: -20, y: -224, width: 40, height: 200}
        this.testCol = getTestFn(this, player)
        this.windStrength = 0.8 // Multiplier for wind force - adjust as needed

        // Create wind particles for visual effect
        for (let i = 0; i < 140; i++) {
            this.add(new WindParticle())
        }
        this.sound = sound
        this.feed(500, 1 / 60)
    }
    
    feed(iterations, dt) {
        for (let i = iterations - 1; i > -1; i--) {
            for (let j = this.children.length - 1; j > -1; j--) {
                this.children[j].update(dt)
            }
        }
    }
    
    update(dt) {
        // Check if player is within the wind hitbox and visible
        const windStrength = this.windStrength * (this.player.velY > 0 ? 0.6: 1)
        if (this.testCol(this, this.player) && this.player.visible) {
            // Get player's center position relative to wind origin
            const dPosX = this.player.pos.x + 32 - this.pos.x
            
            // Switch player to jumping state
            this.player.controls.switchState("jumping", this.player, true, false)
            
            // Apply constant upward force while in the wind tunnel
            // This creates a reliable liftidng effect similar to Ballance game
            this.player.velY -= config.gravity * windStrength * dt
            
            // Optional: add a small horizontal push based on position relative to center
            // This creates a more natural "centering" effect in the wind tunnel
            const hInf = 0.1 // Strength of horizontal centering (very subtle)
            if (Math.abs(dPosX) > 5) { // Only apply if player is off-center
                this.player.velX -= (dPosX / Math.abs(dPosX)) * hInf * dt
            }
        }
        const dist = sqDist(this.pos, this.player.pos)
        if (dist < 172000) {
            if (!this.sound.playing) {
                this.sound.play()
            }
            this.sound.volume = 1 - dist/172000
        } else {
            this.sound.pause()
        }
    }
    
    reset() { }
    
    onRemove() {
        this.parent = null
    }
}

export default Wind