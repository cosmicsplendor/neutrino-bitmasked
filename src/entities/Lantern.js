import { TexRegion } from "@lib/index";
class Lantern extends TexRegion {
    noOverlay=true
    constructor(x, y) {
        super({ frame: "lantern", pos: { x, y: y-4 } })
        this.anchor = {
            x: this.width / 2, y: 0
        }
        
        // Initial rotation
        this.rotation = 0
        
        // Physical properties
        this.angularVelocity = 0
        this.angularDamping = 0.97
        
        // Gravity effect (pulls lantern downward)
        this.gravityStrength = 0.1
        
        // Wind properties
        this.windStrength = 0.02
        this.windFrequency = 0.25
        this.windPhase = Math.random() * Math.PI * 2
        
        // Rotation limit for visual purposes (not hard clamping)
        this.preferredMaxRotation = Math.PI / 4
    }
    
    update(dt, time) {
        // Calculate gravity effect (pulling toward natural hanging position)
        // Add increasing resistance as it approaches max angles
        const angleRatio = this.rotation / this.preferredMaxRotation
        const gravityForce = this.gravityStrength * Math.sin(this.rotation) * (1 + 0.5 * Math.pow(Math.abs(angleRatio), 2))
        
        // Calculate wind effect (using noise-like sinusoidal patterns)
        const windForce = this.windStrength * 
            (Math.sin(time * this.windFrequency + this.windPhase) + 
             Math.sin(time * this.windFrequency * 2.7 + this.windPhase * 3.4) * 0.4)
        
        // Apply forces to angular velocity with increased responsiveness
        this.angularVelocity += (-gravityForce + windForce) * dt * 5
        
        // Apply damping (less damping for more movement)
        this.angularVelocity *= Math.pow(this.angularDamping, dt)
        
        // Update rotation
        this.rotation += this.angularVelocity * dt * 3
        
        // Very soft limits - allow exceeding but with increasing resistance
        if (Math.abs(this.rotation) > this.preferredMaxRotation) {
            // Apply a soft resistance that increases with angle overshoot
            const overshoot = Math.abs(this.rotation) - this.preferredMaxRotation
            const correction = overshoot * 0.03 * Math.sign(this.rotation)
            this.angularVelocity -= correction
        }
    }
}

export default Lantern