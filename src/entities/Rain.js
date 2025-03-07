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
    constructor(camera) {
        super()
        this.camera = camera
        this.lastcameraPos = { x: camera.pos.x, y: camera.pos.y }
        this.pos.x = 0
        this.pos.y = 0
        this.spacing = 120
        this.rowSpacing = 100
        this.rainHeight = new RainTex().height
        this.initRainParticles()
        
        this.onVpChange = () => {
            this.updateParticlesForViewport()
        }
        viewport.on("change", this.onVpChange)
    }

    update(dt) {
        const { rainHeight } = this
        // Calculate camera movement delta
        const deltaX = -(this.camera.pos.x - this.lastcameraPos.x) || 0
        const deltaY = -(this.camera.pos.y - this.lastcameraPos.y) || 0

        this.children.forEach(rain => {
            // Offset by camera movement
            rain.pos.x -= deltaX
            rain.pos.y -= deltaY
            
            // Normal rain fall
            rain.pos.y += rain.velY * dt
            
            // Wrap around logic
            if (rain.pos.y > viewport.height + rainHeight) {
                rain.pos.y = -rainHeight
                rain.pos.x += Math.random() * 20 - 10
            }
            if (rain.pos.y < -rainHeight) {
                rain.pos.y = viewport.height + rainHeight
            }
            if (rain.pos.x > viewport.width + this.spacing) {
                rain.pos.x = -this.spacing
            }
            if (rain.pos.x < -this.spacing) {
                rain.pos.x = viewport.width + this.spacing
            }
        })

        // Store current camera position for next frame
        this.lastcameraPos.x = this.camera.pos.x
        this.lastcameraPos.y = this.camera.pos.y
    }
    onRemove() {
        console.log("Rain cleanup called")
        viewport.off("change", this.onVpChange)
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
}
export default Rain