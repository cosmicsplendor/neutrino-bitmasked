import { TexRegion, Node } from "@lib"
import { compositeDims } from "@utils/entity"

class Title extends Node {
    constructor() {
        super()
        this.logo = new TexRegion({ frame: "logo" })
        this.rock1 = new TexRegion({ frame: "rock1" })
        this.rock2 = new TexRegion({ frame: "rock2" })
        this.ball = new TexRegion({ frame: "ball" })
        this.add(this.rock1)
        this.add(this.rock2)
        this.add(this.ball)
        this.add(this.logo)


        this.ball.pos.x = 88
        this.ball.pos.y = 80
        this.rock1.pos.x = 200
        this.rock2.pos.y += this.rock2.h / 2

        this.ball.anchor = {
            x: this.ball.w * 0.75,
            y: this.ball.h / 2
        }
        this.ball.rotation = 0

        this.alpha = 1
        Object.assign(this, compositeDims(this))
    }
    update(dt) {
        this.ball.rotation += dt * Math.PI / 12
        this.alpha = Math.min(1, this.alpha + 0.5 * dt)
    }
}

export default Title