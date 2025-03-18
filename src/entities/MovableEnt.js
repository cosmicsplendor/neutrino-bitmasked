import { TexRegion } from "@lib"
import { clamp, sign } from "@utils/math"

class MovableEnt extends TexRegion {
    constructor(x, y, frame, toX=x, toY=y, speed=100) {
        super({ frame, pos: { x, y } })
        this.fromX = x
        this.fromY = y
        this.toX = toX
        this.toY = toY
        this.velX = (toX - x) === 0 ? 0: sign(toX - x) * speed
        this.velY = (toY - y) === 0 ? 0: sign(toY - y) * speed
        this.clampX0 = this.fromX < this.toX ? this.fromX: this.toX
        this.clampX1 = this.toX > this.fromX ? this.toX: this.fromX
        this.clampY0 = this.fromY < this.toY ? this.fromY: this.toY
        this.clampY1 = this.toY > this.fromY ? this.toY: this.fromY
    }
    update(dt) {
        const newPosX = this.pos.x + this.velX * dt
        const newPosY = this.pos.y + this.velY * dt
        this.pos.x = clamp(this.clampX0, this.clampX1, newPosX)
        this.pos.y = clamp(this.clampY0, this.clampY1, newPosY)

        ;(this.pos.x !== newPosX) && (this.velX *= -1) // in case the entity moved beyond it's x bounds, reverse it's x-velocity
        ;(this.pos.y !== newPosY) && (this.velY *= -1) // same with the y-velocity
    }
    reset() {
        this.pos.x = this.fromX
        this.pos.y = this.fromY
        this.velX = (this.toX - this.fromX) === 0 ? 0 : sign(this.toX - this.fromX) * Math.abs(this.velX)
        this.velY = (this.toY - this.fromY) === 0 ? 0 : sign(this.toY - this.fromY) * Math.abs(this.velY)
    }
}
export default MovableEnt