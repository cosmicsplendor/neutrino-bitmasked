import Collision from "@lib/components/Collision"
import Movement from "@lib/components/Movement"
import { colRectsId, objLayerId } from "@lib/constants"
import { TexRegion, Node } from "@lib/index"
import config from "@config"
import sparkB from "./sparkB.json"
import sparkL from "./sparkL.json"
import sparkR from "./sparkR.json"
import sparkT from "./sparkT.json"
import ParticleEmitter from "@lib/utils/ParticleEmitter"

class FireBall extends TexRegion {
    static getAnims() {
        if (this.anims) return this.anims
        this.anims = {
            bottom: new ParticleEmitter(sparkB),
            left: new ParticleEmitter(sparkL),
            right: new ParticleEmitter(sparkR),
            top: new ParticleEmitter(sparkT)
        }
        this.anims.bottom.noOverlay = true
        this.anims.left.noOverlay = true
        this.anims.right.noOverlay = true
        this.anims.top.noOverlay = true
        return this.anims
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
        const anim = FireBall.getAnims()[colDir]
        anim.pos.x = this.pos.x + 32
        anim.pos.y = this.pos.y + 64
        Node.get(objLayerId).add(anim)
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