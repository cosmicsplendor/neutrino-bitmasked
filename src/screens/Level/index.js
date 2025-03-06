import { Node } from "@lib"
import { GAME } from "@screens/names"
import resumeImgId from "@assets/images/ui/resume.png"
import arrowImgId from "@assets/images/ui/arrow.png"
import SoundSprite from "@utils/Sound/SoundSprite"
import soundSpriteId from "@assets/audio/sprite.mp3"
import soundMetaId from "@assets/audio/sprite.cson"
import config from "@config"

import initUI from "./initUI"
import { placeBg } from "../utils"

class LevelScreen extends Node {
    background = "#000000"
    curLevel = 0
    constructor({ game, uiRoot, storage }) {
        super()
        this.game = game
        this.storage = storage
        this.uiRoot = uiRoot
    }
    setupSounds() {
        const { game } = this
        const { assetsCache } = game
        const soundSprite = new SoundSprite({ 
            resource: assetsCache.get(soundSpriteId), 
            resourceId: soundSpriteId, 
            meta: assetsCache.get(soundMetaId)
        })
        const contSound = soundSprite.createPool("continue")
        const chSound = soundSprite.createPool("change") 
        const errSound = soundSprite.createPool("error")
        return { contSound, chSound, errSound }

    }
    onEnter(bgEntities, advance) { // second level tells whether to advance to the next level (relative to the current one)
        const fromMenu = !!bgEntities
        const { contSound, chSound, errSound } = this.setupSounds()
        const { game, storage, uiRoot } = this
        if (fromMenu) {
            contSound.play()
            this.curLevel = storage.getCurLevel()
            placeBg(this, bgEntities, [0.033203125,0.06640625,0.107421875], game.renderer.api)
        } else if (advance) {
            this.curLevel = Math.min(this.curLevel + 1, config.levels)
        }
        
        // this.teardownBg = placeBg(this, game.assetsCache, null, game.renderer.api)
        this.teardownUI = initUI({
            onStart: (level, id) => {
                game.switchScreen(GAME, level, id)
                this.curLevel = level
            },
            uiRoot,
            images: {
                arrow: game.assetsCache.get(arrowImgId),
                resume: game.assetsCache.get(resumeImgId)
            },
            assetsCache: game.assetsCache,
            storage,
            level: this.curLevel,
            maxLevel: storage.getCurLevel(),
            contSound,
            chSound,
            errSound,
            syncColor: () => {
                game.renderer.changeBackground("rgb(17, 34, 55)")
                if (this.container) {
                    this.container.overlay = [0.033203125,0.06640625,0.107421875]
                }
            }
        })
    }
    onExit() {
        if (typeof this.teardownBg === "function") this.teardownBg()
        this.teardownUI()
        this.teardownUI = null
    }
}

export default LevelScreen