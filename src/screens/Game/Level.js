import { Camera } from "@lib"
import { cameraId } from "@lib/constants"
import TiledLevel from "@utils/TiledLevel"

class Level extends Camera {
    constructor({ player, uiRoot, data, overlayMap, hitboxMap, bg, fbg, factories, levelDataId, uiImages, onStateChange, gameState, ambience, ...cameraProps }) {
        const arena = new TiledLevel({ 
            data,
            bg, fbg, player,
            factories,
            overlayMap,
            hitboxMap
        })
        super({ ...cameraProps, id: cameraId, world: { width: arena.width - 10, height: arena.height - 30 } })
        this.gameState = gameState
        this.player = player
        this.ambience = ambience                                                                                                                                                                                                                                                                                                                                           
        this.add(arena)
        this.resetRecursively = () => {
            arena.resetRecursively()
        }
        if (ambience) {
            ambience.init()
        }
    }
    update(dt) {
        super.update(dt)
        if (!this.ambience) return
        if (this.gameState.is("completed")) return this.ambience.terminate()
        this.ambience.update(dt)
    }
    onRemove() {
        if (!this.ambience) return
        this.ambience.terminate()
    }
}

export default Level