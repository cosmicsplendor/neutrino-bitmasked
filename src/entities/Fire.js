import getTestFn from "@components/Collision/helpers/getTestFn"
import ParticleEmitter from "@lib/utils/ParticleEmitter"

class Fire extends ParticleEmitter { // it's no ordinary fire, it's an end-marker fire
    _player = null
    testCol = null
    constructor(supProps, onTouch) {
        super(supProps)
        ParticleEmitter.feed(this, 120, 0.02) // feed 2.4 (120 iterations * 0.02 second time step ) seconds worth of update to stabilize the fire
        this.hitbox = {
            x: -20, width: 40,
            y: -15, height: 17
        }
        this.onTouch = onTouch
    }
    get player() {
        return this._player
    }
    set player(val) {
        if (this._player) { return }
        this._player = val
        this.testCol = getTestFn(this, val)
    }
    reset() {
    }
    update() {
        if (!this.player) { return }
        if (this.testCol(this, this.player)) {
            this.pos.x - 32
            this.pos.y - 64
            this.remove()
            this.onTouch()
        }
    }
    onRemove() {
        this.parent = null
    }
}

export default Fire