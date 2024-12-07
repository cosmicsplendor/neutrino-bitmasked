import startGameLoop from "./startGameLoop"
import Texture from "@lib/entities/Texture"
import Sound from "@utils/Sound"

class Game {
    _activeScreen = null
    _sounds = []
    paused = false
    pausedSounds = []
    constructor({ renderer, assetsCache, screenFactories, activeScreen }) {
        this._assetsCache = assetsCache
        this.renderer = renderer
        this.screenFactories = screenFactories
        const screenNames = Object.keys(screenFactories)
        screenNames.forEach(screenName => {
            const createScreen = screenFactories[screenName]
            this[screenName] = createScreen(this)
            this[screenName].name = screenName
        })

        Texture.injectAssetsCache(assetsCache)
        Sound.onCreated = soundObj => { this._sounds.push(soundObj) }
        Sound.onDestroyed = soundObj => { this._sounds = this._sounds.filter(s => s !== soundObj ) }
        if (activeScreen) { this.switchScreen(activeScreen) }
    }
    get assetsCache() { return this._assetsCache }
    createScreen(screenName) {
        const screen = this.screenFactories[screenName](this)
        screen.name = screenName
        this[screenName] = screen
        return screen
    }
    switchScreen(screenName, ...params) {
        this.cleanupSounds()
        if (this._activeScreen) {
            this._activeScreen.onExit()
        }
        this._activeScreen = this[screenName] ? this[screenName]: this.createScreen(screenName)
        this.renderer.scene = this._activeScreen
        if (this._activeScreen.background) { this.renderer.changeBackground(this._activeScreen.background) }
        this._activeScreen.onEnter(...params)
    }
    disposeScreen(screen) {
        this[screen.name] = null
    }
    _update(dt, t) {
       if (this._activeScreen.update) {
           this._activeScreen.update(dt, t)
       }
    }
    start() {
        this.loopControls = startGameLoop({
            mainUpdateFn: () => {},
            renderer: this.renderer
        })
    }
    stopSounds() {
        this._sounds.forEach(sound => {
            sound.pause()
        })
    }
    pauseSounds() {
        this.pausedSounds = this._sounds.filter(sound => sound.playing) // sounds that were playing before pause call
        this._sounds.forEach(sound => {
            sound.pause()
        })
    }
    turnOffSound() {
        this.stopSounds()
        Sound.off()
    }
    turnOnSound() {
        Sound.on()
    }
    pause() {
        if (this.paused) { return }
        this.paused = true
        this.loopControls.pause()
        this.pauseSounds()
        return 
    }
    resume() {
        if (!this.paused) { return }
        this.paused = false
        this.loopControls.resume()
        this.pausedSounds.forEach(sound => {
            sound.resume()
        })
    }
    reset() {
        this.paused = false
        this.loopControls.resume()
        this.pausedSounds = null
    }
    cleanupSounds() {
        this._sounds = []
    }
}

export default Game