const { TexRegion } = require("@lib/index");

class Lever extends TexRegion {
    constructor(x, y) {
        super({ frame: "lever", pos: { x, y } })
        this.anchor = { x: 13, y: 13 }
        this.rotation = 0
    }
    update(dt) {
        this.rotation += dt * Math.PI
    }
}
class Blade extends TexRegion {
    constructor(lever, length) {
        super({ frame: "sb6"})
        this.lever = lever
        this.length = length
        this.syncPos()
    }
    syncPos() {
        const { lever, length } = this
        this.pos.x = lever.anchor.x + length * Math.cos(lever.rotation) - 48,
        this.pos.y = lever.anchor.y + length * Math.sin(lever.rotation) - 48
    }
    update() {
        this.syncPos()
    }
}
class LeverSaw extends TexRegion {
    constructor({ x, y, length=36 }) {
        super({ frame: "plug", pos: { x, y } })
        const lever = new Lever(x + 16, y + 16)
        const blade = new Blade(lever, length)
        this.add(lever)
        this.add(blade)
    }
}

export default LeverSaw