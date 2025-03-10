import { TexRegion } from "@lib/entities"
import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import MovableEnt from "./MovableEnt"
import { sqDist } from "@lib/utils/math"

const offset = 8
const hheight = 24 // laser head height
const bLen = 48 // laser body length
const bWidth = 12 // laser body width
class Laser extends MovableEnt {
    startX
    startY
    // overlay=[0.0235, 0.0235, 0.0235]
    noOverlay=true
    constructor(x, y, toX = x, toY = y, speed = 100, num = 2, vert, period, delay=0, on = true, player, sounds) {
        toX = typeof toX == "number" ? toX: x
        toY = typeof toY == "number" ? toY: y
        const frame = vert ? "vlhd" : "hlhd"
        const bFrame = vert ? "vlbod" : "hlbod" // body frame
        const xOffset = vert ? offset : hheight
        const yOffset = vert ? hheight : hheight - offset - bWidth
        const xStep = vert ? 0 : bLen
        const yStep = vert ? bLen : 0
        super(x, y, frame, toX, toY, speed)
        this.startX = x
        this.startY = y
        if (this.startX !== x || this.startY !== y) this.forceUpd= true
        this.player = player
        for (let i = 0; i < num; i++) {
            const body = new TexRegion({ frame: bFrame })
            body.overlay = [1, 0.125, 0]
            body.pos.x += xOffset + xStep * i
            body.pos.y += yOffset + yStep * i
            body.alpha = on ? 1 : 0
            this.add(body)
        }
        this.hitbox = {
            x: vert ? offset : 0,
            y: vert ? 0 : offset,
            width: vert ? bWidth : hheight + bLen * num,
            height: vert ? hheight + bLen * num : bWidth
        }

        this.testCol = getTestFn(this, this.player)
        this.on = on
        this.on0 = on
        if (!!period) {
            this.period = period
            this.t = 0
            this.sounds = sounds
        }
        this.delay = delay
    }
    update(dt) {
        super.update(dt)
        if (this.delay > 0) {
            this.delay -= dt
            return
        }
        this.elapsed += dt
        if (this.testCol(this, this.player) && this.player.visible && this.on) {
            this.player.explode()
        }
        
        if (!this.period) return

        this.t += dt

        if (this.t <= this.period) return

        this.on = !this.on
        this.t = 0
        for (let child of this.children) {
            child.alpha = this.on ? 1 : 0
        }
        const dist = sqDist(this.pos, this.player.pos)
        if (dist > 144000) return // if the player is farther than 300px return
        const volume = 1 - dist / 144000
        if (this.on) {
            this.sounds.on.play(volume)
            return
        }
        this.sounds.off.play(volume)
    }
    reset() {
        this.pos.x = this.startX
        this.pos.y = this.startY
        this.t = 0
        this.on = this.on0
        for (let child of this.children) {
            child.alpha = this.on ? 1 : 0
        }
    }
}

export default Laser