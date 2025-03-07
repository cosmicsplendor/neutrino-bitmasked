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
    children = []
    gridCells = new Map() // Track particles by grid position
    
    constructor(camera) {
        super()
        this.camera = camera
        this.lastcameraPos = { x: camera.pos.x, y: camera.pos.y }
        this.pos.x = 0
        this.pos.y = 0
        this.spacing = 120
        this.rowSpacing = 100
        this.bufferCells = 2 // Extra buffer cells beyond viewport
        this.rainHeight = new RainTex().height
        
        this.worldOriginX = 0
        this.worldOriginY = 0
        
        this.onVpChange = () => {
            this.width = config.devicePixelRatio * viewport.width
            this.height = config.devicePixelRatio * viewport.height
            this.updateParticlesForViewport()
        }
        this.onVpChange()
        viewport.on("change", this.onVpChange)
        this.currentCells = new Set()
    }

    update(dt) {
        const { rainHeight, width, height, currentCells } = this
        
        // Calculate camera movement delta
        const deltaX = -(this.camera.pos.x - this.lastcameraPos.x) || 0
        const deltaY = -(this.camera.pos.y - this.lastcameraPos.y) || 0
        // Update world origin based on camera movement
        this.worldOriginX += deltaX
        this.worldOriginY += deltaY
        
        // Determine the visible grid bounds
        const startCol = Math.floor((this.worldOriginX - this.bufferCells * this.spacing) / this.spacing)
        const endCol = Math.ceil((this.worldOriginX + width + this.bufferCells * this.spacing) / this.spacing)
        const startRow = Math.floor((this.worldOriginY - this.bufferCells * this.rowSpacing - rainHeight) / this.rowSpacing)
        const endRow = Math.ceil((this.worldOriginY + height + this.bufferCells * this.rowSpacing) / this.rowSpacing)
        
        // Update existing particles and create new ones as needed
        for (let col = startCol; col <= endCol; col++) {
            for (let row = startRow; row <= endRow; row++) {
                const cellKey = `${col},${row}`
                currentCells.add(cellKey)
                
                // Calculate world position for this grid cell
                const worldX = col * this.spacing
                const worldY = row * this.rowSpacing
                
                // Calculate screen position
                const screenX = worldX - this.worldOriginX
                const screenY = worldY - this.worldOriginY
                
                // Use existing particle or create new one
                let rain
                if (this.gridCells.has(cellKey)) {
                    rain = this.gridCells.get(cellKey)
                } else {
                    console.log("Creating new raintex")
                    rain = new RainTex()
                    this.add(rain)
                    this.gridCells.set(cellKey, rain)
                }
                
                // Set position
                rain.pos.x = screenX
                rain.pos.y = screenY + (rain.fallOffset || 0)
                
                // Update fall animation
                rain.fallOffset = (rain.fallOffset || 0) + rain.velY * dt
                
                // Reset fall if needed
                if (rain.fallOffset > this.rowSpacing) {
                    rain.fallOffset = 0
                }
            }
        }
        
        // Remove particles that are no longer in visible grid cells
        this.children = []
        for (const [cellKey, rain] of this.gridCells.entries()) {
            if (!currentCells.has(cellKey)) {
                // Node.removeChild(this, rain, false)
                rain.parent = null
                this.gridCells.delete(cellKey)
            } else {
                this.children.push(rain)
            }
        }
        
        // Store current camera position for next frame
        this.lastcameraPos.x = this.camera.pos.x
        this.lastcameraPos.y = this.camera.pos.y
        currentCells.clear()
    }
    
    onRemove() {
        viewport.off("change", this.onVpChange)
    }
    
    reset() {
        this.children.length = 0
        this.gridCells.clear()
        this.worldOriginX = 0
        this.worldOriginY = 0
    }
    
    updateParticlesForViewport() {
        // Reset the system
        this.reset()
    }
}
export default Rain