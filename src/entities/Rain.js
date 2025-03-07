import { Node, TexRegion } from "@lib/index";
import config from "@config"
const { viewport } = config

class RainTex extends TexRegion {
    noOverlay=true
    forceUpdate=true
    constructor() {
        super({ frame: "rain" })
        this.velY = 300 // falling speed
    }
}

class Rain extends Node {
    constructor() {
        super()
        this.pos.x = 0
        this.pos.y = 0
        this.spacing = 120 // horizontal spacing
        this.rowSpacing = 100 // vertical spacing
        this.rainHeight = new RainTex().height
        this.initRainParticles()
        this.onVpChange = () => {
            this.updateParticlesForViewport()
        }
        viewport.on("change", this.onVpChange)
    }

    initRainParticles() {
        const columns = Math.ceil((viewport.width + 24) / this.spacing)
        const rows = Math.ceil((viewport.height + this.rainHeight) / this.rowSpacing)
        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                const rain = new RainTex()
                rain.pos.x = i * this.spacing + Math.random() * 20 // slight random offset
                rain.pos.y = j * this.rowSpacing + Math.random() * 20
                this.add(rain)
            }
        }
    }

    updateParticlesForViewport() {
        // Clear existing particles
        this.children.length = 0
        // Reinitialize with new viewport dimensions
        this.initRainParticles()
    }

    update(dt) {
        const { rainHeight } = this.rainHeight
        this.children.forEach(rain => {
            // Update position based on velocity
            rain.pos.y += rain.velY * dt
            
            // Reset position if below viewport
            if (rain.pos.y > viewport.height + rainHeight) {
                rain.pos.y = -rainHeight // Reset to above viewport
                rain.pos.x += Math.random() * 20 - 10 // Add some randomness to x position
            }
        })
    }

    onRemove() {
        console.log("Rain cleanup called")
        viewport.off("change", this.onVpChange)
    }
}

export default Rain