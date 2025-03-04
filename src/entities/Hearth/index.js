import Collision from "@lib/components/Collision"
import Movement from "@lib/components/Movement"
import { colRectsId, objLayerId } from "@lib/constants"
import { TexRegion, Node } from "@lib/index"
import config from "@config"
import { pickOne, rand } from "@lib/utils/math"

class FireBall extends TexRegion {
    static getFireAnim() {
        // if (this.deathAnim instanceof ParticleEmitter) return this.deathAnim
        // this.deathAnim = new ParticleEmitter(deathAnimDat)
        // this.deathAnim.noOverlay = true
        // // this.deathAnim.overlay = [1,0,0]
        // return this.deathAnim
      }
    hitCirc={
        x: 2,
        y: 2,
        radius: 30
    }
    onWallCol(block, velX, velY, _, reboundX, reboundY) {
        const colDir = this.colDir
        this.velY = colDir === "top" ? 50:
            colDir === "bottom" ? -500: velY
        this.velX = colDir === "left" ? 75:
            colDir === "right" ? -75: velX
        // this.scale.x *= 0.9
        // this.scale.y = this.scale.x
    }
    constructor(x, y) {
        super({ frame: "fireball", overlay: "none", pos: { x, y } })
        this.wallCollision = new Collision({ entity: this, blocks: colRectsId, rigid: true, movable: false, onHit: this.onWallCol.bind(this) })
        Movement.makeMovable(this, { velX: 100, velY: 0, accX: 0, accY: config.gravity * 0.75})   
        this.scale = { x: 1, y: 1 }
        this.timeout = 0.75
        this.decayF = 1
    }
    update(dt) {
        Movement.update(this, dt)
        if (this.timeout > 0){
            this.timeout -= dt
            return
        }
        this.wallCollision.update(dt)
    }
}

class Hearth extends Node {
    constructor({ x, y }) {
        super({ pos: { x, y }})
        const hearth = new TexRegion({ frame: "hearth", overlay: "none" })
        const hearthBg = new TexRegion({ frame: "hearthbg", overlay: "none", pos: { x: x + 36, y: y + 56 } })
        // this.add(hearthBg)
        this.add(hearth)
        const fireBall = new FireBall(x + 32, y)
        // fireNode.add(fireBall)
        Node.get(objLayerId).add(hearthBg)
        Node.get(objLayerId).add(fireBall)
    }
}

export default Hearth