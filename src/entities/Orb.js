import { Node } from "@lib"
import ParticleEmitter from "@lib/utils/ParticleEmitter"
import { sqLen } from "@lib/utils/math"
import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import { objLayerId } from "@lib/constants"

class Orb extends ParticleEmitter {
    chasing = false
    constructor({ player, sound, storage, temp = false, ...rest }) {
        super({ ...rest })
        this.player = player
        this.sound = sound
        this.hitbox = { x: 5, y: 5, width: 14, height: 14}
        this.testCol = getTestFn(this, player)
        this.active = true
        this.storage = storage
        this.temp = temp
    }
    update() {
        if (!this.active) { return }
        const dPosX = this.player.pos.x + this.player.width / 2 - this.pos.x
        const dPosY = this.player.pos.y + this.player.width / 2 - this.pos.y
        const sqDist = sqLen(dPosX, dPosY)
        if (sqDist > 14400 && !this.chasing) { // distance > 120
            return 
        }
        this.chasing = true
        this.pos.x += dPosX / 60
        this.pos.y += dPosY / 60
        if (this.testCol(this, this.player) && this.player.visible) {
            this.sound.play()
            this.storage.setOrbCount(this.storage.getOrbCount() + 1)
            this.remove()
        }
    }
    reset() { 
        this.chasing = false
        this.temp && this.remove()
    }
    onRemove() {
        this.parent = null
        this.chasing = false
    }
}

export default Orb