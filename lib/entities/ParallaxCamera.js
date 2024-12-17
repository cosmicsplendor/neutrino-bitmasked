import { clamp } from "@utils/math"
import Camera from "./Camera"

export const getMinmax = tiles => {
    return tiles.reduce((acc, tile) => { // y-coordinates of the baseline where parallax entities stand (the max y-coordinate within which all the entities are bound)
        // return Math.max(acc, tile.pos.y + tile.height)
        acc.max = Math.max(acc.max, tile.pos.y + tile.height)
        acc.min = Math.min(acc.min, tile.pos.y)
        return acc
    }, { min: Infinity, max: -Infinity })
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
        const { min, max } = getMinmax(val)
        val.forEach(tile => {
            tile.pos.y -= min
        })
        this.baseline = max - min
        console.log(this.baseline)
    }
    setWorld({ worldWidth, worldHeight }) { // this assumes that we only have two parallax backgrounds
        // const dy = (worldHeight + 2 - this.baseline) / this.z
        const maxWoCamY = worldHeight - this.bounds.height // max position of the world-layer camera
        const maxCamY = maxWoCamY * this.pF // max camera y-coordinates in this layer
        const dy = maxCamY + this.bounds.height - this.baseline // baseline in this layer
        

        this.world.width = worldWidth
        this.world.height = worldHeight
        this.tiles.forEach(tile => {
            const tileCopy = { ...tile } // tile shouldn't be mutated
            tileCopy.pos = { 
                x: tile.pos.x,
                y: tile.pos.y + dy
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