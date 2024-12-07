import { Camera } from "@lib"
import TiledLevel from "@utils/TiledLevel"

class Level extends Camera {
    constructor({ player, uiRoot, data, overlayMap, bg, fbg, factories, levelDataId, uiImages, onStateChange, gameState, ambience, ...cameraProps }) {
        const arena = new TiledLevel({ 
            data,
            bg, fbg, player,
            factories,
            overlayMap
        })
        super({ ...cameraProps, world: { width: arena.width, height: arena.height } })
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