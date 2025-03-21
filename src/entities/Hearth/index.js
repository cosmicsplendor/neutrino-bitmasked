import Collision from "@lib/components/Collision"
import Movement from "@lib/components/Movement"
import { colRectsId, mgLayerId, objLayerId } from "@lib/constants"
import { TexRegion, Node } from "@lib/index"
import config from "@config"
import sparkB from "./sparkB.json"
import sparkL from "./sparkL.json"
import sparkR from "./sparkR.json"
import sparkT from "./sparkT.json"
import ParticleEmitter from "@lib/utils/ParticleEmitter"
import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import { rand, sqDist } from "@lib/utils/math"
import Pool from "@lib/utils/Pool"

class FireBall extends TexRegion {
    forceUpd = true
    hits = 0
    deadIn = 2
    reset() {
        this.remove()
        this.parent = null
    }
    static getAnims() {
        if (this.anims) return this.anims

        this.anims = {
            bottom: new Pool({
                factory: () => {
                    const particle = new ParticleEmitter(sparkB)
                    particle.noOverlay = true
                    return particle
                },
                size: 2
            }),
            left: new Pool({
                factory: () => {
                    const particle = new ParticleEmitter(sparkL)
                    particle.noOverlay = true
                    return particle
                },
                size: 2
            }),
            right: new Pool({
                factory: () => {
                    const particle = new ParticleEmitter(sparkR)
                    particle.noOverlay = true
                    return particle
                },
                size: 2
            }),
            top: new Pool({
                factory: () => {
                    const particle = new ParticleEmitter(sparkT)
                    particle.noOverlay = true
                    return particle
                },
                size: 2
            })
        }
        this.anims.bottom.noOverlay = true
        this.anims.left.noOverlay = true
        this.anims.right.noOverlay = true
        this.anims.top.noOverlay = true
        return this.anims
    }
    hitCirc = {
        x: 4,
        y: 4,
        radius: 26
    }
    onWallCol(_, velX, velY,) {
        const colDir = this.colDir
        this.velY = colDir === "top" ? 50 :
            colDir === "bottom" ? -500 * (1 - this.hits / 50) : velY
        this.velX = colDir === "left" ? 75 :
            colDir === "right" ? -75 : velX
        const anim = FireBall.getAnims()[colDir].create()

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

        if (sqDist(this.pos, this.player.pos) < 169000) {
            this.hearth.sound.play(1)
        }
        this.hits++
        if (this.hits > 9) {
            this.emit()
            if (colDir !== "bottom") {
                return this.reset()
            }
            this.dormant = true
            return
        }
        TexRegion.syncFrame(this, "fireball" + this.hits)
        this.hitCirc = {
            x: 4, y: 4, radius: 26 - this.hits
        }
    }
    emit() {
        if (this.emitted) {
            return
        }
        this.hearth.emit()
        this.emitted = true
    }
    constructor(x, y, hearth, player) {
        super({ frame: "fireball", overlay: "none", pos: { x, y } })
        this.hearth = hearth
        this.wallCollision = new Collision({ entity: this, blocks: colRectsId, rigid: true, movable: false, onHit: this.onWallCol.bind(this), roll: false })
        Movement.makeMovable(this, { velX: 75 * hearth.dir, velY: 0, accX: 0, accY: config.gravity * 0.75 })
        this.scale = { x: 1, y: 1 }
        this.timeout = 0.75
        this.decayF = 1
        this.rotation = 0
        this.anchor = {
            x: 32, y: 32
        }
        this.player = player
        this.testCol = getTestFn(this, player)
    }
    update(dt) {
        if (this.dormant) {
            this.deadIn -= dt
            this.alpha = this.deadIn * 0.5
            if (this.deadIn < 0) {
                this.reset()
            }
            return
        }
        if (this.testCol(this, this.player)) {
            this.reset()
            this.player.explode()
            return
        }
        Movement.update(this, dt)
        if (this.timeout > 0) {
            this.timeout -= dt
            return
        }
        this.wallCollision.update(dt)
        this.rotation += dt * this.velX * 0.015
    }
}


class Hearth extends Node {
    active = false
    constructor({ x, y, player, dir = 1, sound, det = false }) {
        super({ pos: { x, y } })
        const hearth1 = new TexRegion({ frame: "hearth1", overlay: "none" })
        const hearth2 = new TexRegion({ frame: "hearth2", overlay: "none", pos: { x: 66, y: 0 } })
        const hearth3 = new TexRegion({ frame: "hearth3", overlay: "none", pos: { x: 134, y: 0 } })
        const hearthBg = new TexRegion({ frame: "hearthbg", overlay: "none", pos: { x: x + 44, y: y + 55 } })
        this.det = det
        this.add(hearth1)
        this.add(hearth2)
        this.add(hearth3)
        Node.get(mgLayerId).add(hearthBg)
        this.player = player
        this.dir = dir
        this.sound = sound
    }
    reset() {
        this.active = false
    }
    emit() {
        const offset = this.det ? 0 : rand(-32, 32)
        const fireBall = new FireBall(this.pos.x + 80 + offset, this.pos.y, this, this.player)
        Node.get(objLayerId).add(fireBall)
    }
    update() {
        if (this.active) {
            return
        }
        if (sqDist(this.pos, this.player.pos) < 120000) {
            this.active = true
            this.emit()
        }
    }
}

export default Hearth