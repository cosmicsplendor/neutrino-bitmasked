const { TexRegion } = require("@lib/index");

class Lever extends TexRegion {
    forceUpdate=true
    constructor(x, y) {
        super({ frame: "lever", pos: { x, y } })
        this.anchor = { x: 12, y: 14 }
        this.rotation = 0
    }
    update(dt) {
        // this.rotation += dt * Math.PI
    }
}
class Blade extends TexRegion {
    forceUpdate=true
    constructor(lever, length, player) {
        super({ frame: "sb7"})
        this.lever = lever
        this.length = length
        this.player = player
        this.syncPos()
    }
    syncPos() {
        const { lever, length } = this
        this.pos.x = lever.pos.x + lever.anchor.x + length * Math.cos(lever.rotation) - 48,
        this.pos.y = lever.pos.y + lever.anchor.y + length * Math.sin(lever.rotation) - 48
    }
    update() {
        this.syncPos()
    }
}
class LeverSaw extends TexRegion {
    noOverlay=true
    constructor({ x, y, length=36, player }) {
        super({ frame: "plug", pos: { x, y } })
        const lever = new Lever(28, 16)
        const blade = new Blade(lever, length, player)
        this.add(lever)
        this.add(blade)
    }
}

export default LeverSaw