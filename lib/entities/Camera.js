import { Node } from "@lib"
import { clamp, aabb } from "@utils/math"
import { calcCenter, rectBounds } from "@utils/entity"
import config from "@config"

const focSpeed = 10

class Camera extends Node {
    shakeIntensity = 0
    shakeDecay = 0.9 // Decay factor per second
    shakeOffset = { x: 0, y: 0 }
    constructor({ subject, viewport, world, z = 1, instF=false,...nodeProps }) {
        super({ ...nodeProps })
        this.z = z // camera depth factor (z-index)
        this.pF = 1 / z // parallax factor is the multiplicative inverse of z-index
        this.bounds = {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
        }
        this.world = world || { width: viewport.width, height: viewport.height }
        this.onViewportChange = viewport => {
            this.bounds.width = viewport.width *  config.devicePixelRatio
            this.bounds.height = viewport.height *  config.devicePixelRatio
            this.focusInst()
        }
        this.viewport = viewport
        this.setSubject(subject)
        viewport.on("change", this.onViewportChange)
        this.onViewportChange(viewport)
        this.instF = instF
        this.focus()
    }
    
    intersects(node) {
        // if the node is either the root or just a container (meaning it doesn't have explicit bounds) return true
        if (node === this || (!node.width && !node.height && !node.hitbox)) {
            return true
        }
        const intersects = aabb(rectBounds(node), this.bounds)
        return intersects
    }
    
    setSubject(subject) {
        if (!subject) { return }
        this.subject = subject
        this.offset = calcCenter(subject)
        this.focus()
    }
    
    focusInst() { // focus instantly
        if (!this.subject) { return }
        this.pos.x = this.pF * (-clamp(0, this.world.width - this.bounds.width, this.subject.pos.x + this.offset.x - this.bounds.width / 2)) + this.shakeOffset.x
        this.pos.y = this.pF * (-clamp(0, this.world.height - this.bounds.height, this.subject.pos.y + this.offset.y - this.bounds.height / 2)) + this.shakeOffset.y
    }
    
    focus(dt) {
        if (!this.subject) { return }
        const destX = this.pF * (-clamp(0, this.world.width - this.bounds.width, this.subject.pos.x + this.offset.x - this.bounds.width / 2))
        const destY = this.pF * (-clamp(0, this.world.height - this.bounds.height, this.subject.pos.y + this.offset.y - this.bounds.height / 2))
        this.pos.x += (destX - this.pos.x) * focSpeed * dt
        this.pos.y += (destY - this.pos.y) * focSpeed * dt
        
        // Apply shake offset
        this.pos.x += this.shakeOffset.x
        this.pos.y += this.shakeOffset.y
    }
    
    /**
     * Adds camera shake effect with specified intensity
     * @param {number} intensity - Shake intensity from 0 to 1
     */
    shake(intensity) {
        // Add to current intensity but cap at 1
        this.shakeIntensity = Math.min(1, this.shakeIntensity + intensity)
    }
    
    update(dt) {
        // Update shake effect
        if (this.shakeIntensity > 0) {
            // Calculate new random offset based on intensity
            const maxOffset = 30 * this.shakeIntensity // Maximum pixel offset
            this.shakeOffset.x = (Math.random() * 2 - 1) * maxOffset,
            this.shakeOffset.y = (Math.random() * 2 - 1) * maxOffset
            // Apply decay
            this.shakeIntensity *= Math.pow(this.shakeDecay, dt)
            
            // If intensity is very small, set to zero
            if (this.shakeIntensity < 0.01) {
                this.shakeIntensity = 0
                this.shakeOffset.x = 0 
                this.shakeOffset.y = 0
            }
        }
        
        if (this.instF) {
            this.focusInst()
            return
        }
        this.focus(dt)
    }
    
    onRemove() {
        this.viewport.off(this.onViewportChange)
    }
}
export default Camera