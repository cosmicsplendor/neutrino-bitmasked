import { Node, TexRegion } from "@lib/index";
class Vent extends Node {
    noOverlay=true
    constructor(x, y) {
        super({
            pos: { x, y }
        })
        this.fan = new TexRegion({ frame: "fan", pos: { x: 24, y: 24, }})
        this.vent = new TexRegion({ frame: "vent", pos: { x: 0, y: 0 }})
        this.fan.rotation = 0
        this.fan.anchor = { x: 47, y: 47 }
        this.add(this.fan)
        this.add(this.vent)
    }
    update(dt) {
        this.fan.rotation += 6 * dt
    }
}

export default Vent