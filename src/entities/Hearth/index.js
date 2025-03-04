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
    forceUpdate = true
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
        x: 4,
        y: 4,
        radius: 26
    }
    onWallCol(block, velX, velY, _, reboundX, reboundY) {
        const colDir = this.colDir
        this.velY = colDir === "top" ? 50:
            colDir === "bottom" ? -500: velY
        this.velX = colDir === "left" ? 75:
            colDir === "right" ? -75: velX
        const anim = FireBall.getAnims()[colDir]
        
        Node.get(objLayerId).add(anim)
        if (colDir === "bottom") {
            anim.pos.x = this.pos.x + 32
            anim.pos.y = this.pos.y + 64
        } else if (colDir === "top") {
            anim.pos.x = this.pos.x + 32
            anim.pos.y = this.pos.y
        } else if (colDir === "left") {
            anim.pos.x = this.pos.x
            anim.pos.y = this.pos.y + 32
        } else if (colDir === "right") {    
            anim.pos.x = this.pos.x + 64
            anim.pos.y = this.pos.y + 32
        }
    }
    constructor(x, y) {
        super({ frame: "fireball", overlay: "none", pos: { x, y } })
        this.wallCollision = new Collision({ entity: this, blocks: colRectsId, rigid: true, movable: false, onHit: this.onWallCol.bind(this), roll: false })
        Movement.makeMovable(this, { velX: -50, velY: 0, accX: 0, accY: config.gravity * 0.75})   
        this.scale = { x: 1, y: 1 }
        this.timeout = 0.75
        this.decayF = 1
        this.rotation = 0
        this.anchor = {
            x: 32, y: 32
        }
    }
    update(dt) {
        Movement.update(this, dt)
        if (this.timeout > 0){
            this.timeout -= dt
            return
        }
        this.wallCollision.update(dt)
        this.rotation += dt * this.velX * 0.01
    }
}

class Hearth extends Node {
    constructor({ x, y }) {
        super({ pos: { x, y }})
        const hearth1 = new TexRegion({ frame: "hearth1", overlay: "none" })
        const hearth2 = new TexRegion({ frame: "hearth2", overlay: "none", pos: { x: 66, y: 0 } })
        const hearth3 = new TexRegion({ frame: "hearth3", overlay: "none", pos: { x: 134, y: 0 } })
        const hearthBg = new TexRegion({ frame: "hearthbg", overlay: "none", pos: { x: x + 44, y: y + 55 } })
        this.add(hearth1)
        this.add(hearth2)
        this.add(hearth3)
        const fireBall = new FireBall(x + 32, y)
        Node.get(objLayerId).add(hearthBg)
        Node.get(objLayerId).add(fireBall)
    }
}

export default Hearth