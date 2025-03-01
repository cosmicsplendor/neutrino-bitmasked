import { Node, TexRegion } from "@lib/index";
class Vent extends Node {
    noOverlay=true
    constructor(x, y) {
        super({
            pos: { x, y }
        })
        this.fan = new TexRegion({ frame: "fan", pos: { x: 24, y: 24, }})
        this.vent = new TexRegion({ frame: "vent", pos: { x: 0, y: 0 }})
        this.pipe1 = new TexRegion({ frame: "piping", pos: { x: 43, y: 144 }, scale: { x: -1, y: 1 }})
        this.pipe2 = new TexRegion({ frame: "piping", pos: { x: 98, y: 144 }})
        this.fan.rotation = 0
        this.fan.anchor = { x: 47, y: 47 }
        this.add(this.fan)
        this.add(this.vent)
        this.add(this.pipe1)
        this.add(this.pipe2)
    }
    update(dt) {
        this.fan.rotation += 6 * dt
    }
}

export default Vent