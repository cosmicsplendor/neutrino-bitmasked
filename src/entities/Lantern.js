import { TexRegion } from "@lib/index";
class Fly extends TexRegion {
    constructor() {
        super({ frame: "fly", pos: { x: 0, y: 0 } })
        
        // Movement parameters
        this.radius = 72          // Maximum distance from center
        this.speed = 10          // Movement speed
        this.changeFreq = 4    // How often direction changes
        
        // State variables for smooth movement
        this.angle = Math.random() * Math.PI * 2
        this.targetAngle = this.angle
        this.angleSpeed = 0
        
        // Initialize both current and target radius
        this.currentRadius = Math.random() * this.radius
        this.targetRadius = this.currentRadius
        
        // Offset tracking
        this.offsetX = 0
        this.offsetY = 0
        
        // Last time we changed direction
        this.lastChangeTime = 0
        this.scale= {x: 0.5, y: 0.5}
    }
    
    update(dt, time) {
        // Get parent center (base position)
        const centerX = this.parent.centerX
        const centerY = this.parent.centerY
        
        // Safety check for parent center
        if (centerX === undefined || centerY === undefined) {
            return; // Skip update if parent center is not available
        }
        
        // Occasionally change target angle and radius - but use time-based check 
        // instead of random to ensure more consistent behavior
        if (time - this.lastChangeTime > 1/this.changeFreq) {
            this.targetAngle = Math.random() * Math.PI * 2
            this.targetRadius = Math.random() * this.radius
            this.lastChangeTime = time;
        }
        
        // Smooth angle interpolation
        const angleDiff = ((this.targetAngle - this.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI
        this.angleSpeed += angleDiff * dt * 3
        this.angleSpeed *= 0.95  // Damping
        this.angle += this.angleSpeed * dt
        
        // Smooth radius interpolation
        this.currentRadius += (this.targetRadius - this.currentRadius) * dt * 2
        
        // Calculate new position using angle and radius
        this.offsetX = Math.cos(this.angle) * this.currentRadius
        this.offsetY = Math.sin(this.angle) * this.currentRadius
        
        // Apply offset from center
        this.pos.x = centerX - 6 + this.offsetX
        this.pos.y = centerY - 6 + this.offsetY
        
        // Safety check for NaN values
        if (isNaN(this.pos.x) || isNaN(this.pos.y)) {
            // Reset to center if we somehow got NaN
            this.pos.x = centerX - 12
            this.pos.y = centerY - 12
            // Reset movement variables
            this.angle = 0
            this.targetAngle = 0
            this.angleSpeed = 0
            this.currentRadius = 0
            this.targetRadius = this.radius / 2
        }
    }
}
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
        this.angVel = 0
        this.damping = 0.97
        
        // Gravity effect (pulls lantern downward)
        this.gravityStrength = 0.1
        
        // Wind properties
        this.windStrength = 0.02
        this.windFrequency = 0.25
        this.windPhase = Math.random() * Math.PI * 2
        
        // Rotation limit for visual purposes (not hard clamping)
        this.maxRot = Math.PI / 4
        for (let i =0; i< 5; i++) {
            this.add(new Fly())
        }
        this.centerX = this.width * 0.5
        this.centerY = this.height * 0.6
    }
    
    update(dt, time) {
        // Calculate gravity effect (pulling toward natural hanging position)
        // Add increasing resistance as it approaches max angles
        const angleRatio = this.rotation / this.maxRot
        const gravity = this.gravityStrength * Math.sin(this.rotation) * (1 + 0.5 * Math.pow(Math.abs(angleRatio), 2))
        
        // Calculate wind effect (using noise-like sinusoidal patterns)
        const windForce = this.windStrength * 
            (Math.sin(time * this.windFrequency + this.windPhase) + 
             Math.sin(time * this.windFrequency * 2.7 + this.windPhase * 3.4) * 0.4)
        
        // Apply forces to angular velocity with increased responsiveness
        this.angVel += (-gravity + windForce) * dt * 5
        
        // Apply damping (less damping for more movement)
        this.angVel *= Math.pow(this.damping, dt)
        
        // Update rotation
        this.rotation += this.angVel * dt * 3
        
        // Very soft limits - allow exceeding but with increasing resistance
        if (Math.abs(this.rotation) > this.maxRot) {
            // Apply a soft resistance that increases with angle overshoot
            const overshoot = Math.abs(this.rotation) - this.maxRot
            const correction = overshoot * 0.03 * Math.sign(this.rotation)
            this.angVel -= correction
        }
        
    }
}

export default Lantern