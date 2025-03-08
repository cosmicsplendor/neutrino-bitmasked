import TexRegion from "@lib/entities/TexRegion";

class Cobweb extends TexRegion {
    overlay = [0.7, 0.7, 0.7]
    
    constructor(x, y) {
        super({ frame: "cobweb", pos: { x, y }})
        this.scale = { x: 1, y: 1 }
        
        // Initialize variables for the wind animation
        this.baseScale = { x: 1, y: 1 }
        this.time = 0
        this.windSpeed = 0.8 + Math.random() * 0.4 // Random base wind speed
        
        // Create multiple frequency components for natural movement
        this.frequencies = [
            0.5 + Math.random() * 0.3,  // Slow primary oscillation
            1.2 + Math.random() * 0.5,  // Medium secondary oscillation
            2.3 + Math.random() * 0.7   // Fast tertiary oscillation
        ]
        
        // Set the base amplitude
        this.baseAmplitude = 0.15
        
        // Offset for the sine wave to create asymmetric movement
        // This shifts the range from [-amplitude, +amplitude] to [minScale, maxScale]
        this.scaleOffset = 0.05
        
        // Phase offsets for each sine component to avoid synchronized patterns
        this.phaseOffsets = [
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        ]
    }
    
    update(dt) {
        // Increment time based on delta time
        this.time += dt * this.windSpeed
        
        // Calculate the y-scale modification using combined sine waves with phase offsets
        let yScaleModifier = 0
        
        // Primary oscillation (higher amplitude)
        yScaleModifier += Math.sin(this.time * this.frequencies[0] + this.phaseOffsets[0]) * this.baseAmplitude
        
        // Secondary oscillation (medium amplitude)
        yScaleModifier += Math.sin(this.time * this.frequencies[1] + this.phaseOffsets[1]) * (this.baseAmplitude * 0.5)
        
        // Tertiary oscillation (small amplitude)
        yScaleModifier += Math.sin(this.time * this.frequencies[2] + this.phaseOffsets[2]) * (this.baseAmplitude * 0.2)
        
        // Add offset to make movement asymmetric (more expansion than contraction)
        yScaleModifier += this.scaleOffset
        
        // Apply the scale modification
        this.scale.y = this.baseScale.y * (1 + yScaleModifier)
        
        // Keep x scale constant
        this.scale.x = this.baseScale.x
    }
}
export default Cobweb