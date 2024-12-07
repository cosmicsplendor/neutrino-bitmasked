import { clamp } from "@utils/math"
import Camera from "./Camera"

export const getBaseline = tiles => {
    return tiles.reduce((acc, tile) => { // y-coordinates of the baseline where parallax entities stand (the max y-coordinate within which all the entities are bound)
        return Math.max(acc, tile.pos.y + tile.height)
    }, 0)
}

class ParallaxCamera extends Camera {
    _layoutTiles = () => {}
    _tiles = null
    constructor({ entYOffset = 0, tiles, ...rest }) {
        super({ ...rest })
        this.entYOffset = entYOffset
        this.tiles = tiles
        this.prevPos = { x: 0, y: 0 }
    }
    get tiles() {
        return this._tiles
    }
    set tiles(val) {
        if (!val) { return }
        this._tiles = val
        this.baseline = getBaseline(val)
    }
    setWorld({ worldWidth, worldHeight }) { // this assumes that we only have two parallax backgrounds
        // in case baselineAtop is not undefined, it's assumed that this is the parallax-far-bg layer
        const baselineToBtmBounds = Math.min(worldHeight - this.baseline, (this.bounds.height - this.subject.height) / 2)


        const maxFy = this.baseline - this.subject.height / 2 // assuming the subject is restricted within baseline, calculating it's max y position
        const maxWoCamY = clamp(0, worldHeight - this.bounds.height, maxFy - this.bounds.height / 2) // max position of the world-layer camera
        const maxCamY = maxWoCamY * this.pF // max camera y-coordinates in this layer
        const bl = maxCamY + this.bounds.height - baselineToBtmBounds // baseline in this layer
        const blOffset = baselineToBtmBounds * (1 - 1 / this.z)

        this.world.width = worldWidth
        this.world.height = worldHeight
        this.tiles.forEach(tile => {
            const tileCopy = { ...tile } // tile shouldn't be mutated
            tileCopy.pos = { 
                x: tile.pos.x,
                y: (bl + blOffset) - (this.baseline - tile.pos.y) + this.entYOffset
            }
            this.add(tileCopy)
        })
    }
    layoutTiles({ width: worldWidth=this.world.width, height: worldHeight=this.world.height, tiles=this.tiles }) { // recalculate tiles layout
        if (worldHeight === this.world.height && tiles === this.tiles) { // return early if nothing hasn't changed
            return this.world.width = worldWidth
        }

        if (tiles !== this.tiles) {
            this.tiles = tiles
        }

        // taking advantage of closure to avoid unnecessary state setups and dependencies
        this.viewport.off("change", this._layoutTiles) // remove previous listener from viewport observable, so that the camera can be reused across multiple levels
        this._layoutTiles =  () => { // re-layout the tiles
            this.children = []
            this.setWorld({ worldWidth, worldHeight })
        }
        this.viewport.on("change", this._layoutTiles) // and attach a new one
        this._layoutTiles() // performing the actual (initial) work
    }
    onRemove() {
        super.onRemove()
        this.viewport.off("change", this._layoutTiles)
    }
}

export default ParallaxCamera