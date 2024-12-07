import { TexRegion } from "@lib/entities"
import getTestFn from "@lib/components/Collision/helpers/getTestFn"
import MovableEnt from "./MovableEnt"

const offset = 2
const hheight = 24 // laser head height
const bLen = 48 // laser body length
const bWidth = 12 // laser body width
class Laser extends MovableEnt {
    startX
    startY
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
        if (this.startX !== x || this.startY !== y) this.forceUpdate = true
        this.player = player
        for (let i = 0; i < num; i++) {
            const body = new TexRegion({ frame: bFrame })
            body.pos.x += xOffset + xStep * i
            body.pos.y += yOffset + yStep * i
            body.alpha = on ? 1 : 0
            this.add(body)
        }
        this.hitbox = {
            x: vert ? offset : 0,
            y: vert ? 0 : offset,
            width: vert ? bWidth : hheight + bLen * num,
            height: vert ? hheight + bLen * num : hheight
        }
        this.testCol = getTestFn(this, this.player)
        this.on = on
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
        const dPX = this.pos.x - this.player.pos.x
        const dPY = this.pos.y - this.player.pos.y
        if (dPX * dPX + dPY * dPY > 90000) return // if the player is farther than 300px return
        if (this.on) {
            this.sounds.on.play()
            return
        }
        this.sounds.off.play()
    }
    reset() {
        this.pos.x = this.startX
        this.pos.y = this.startY
        this.t = 0
    }
}

export default Laser