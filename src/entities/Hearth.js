import { TexRegion, Node } from "@lib/index"

class Hearth extends Node {
    constructor() {
        super({ pos: { x, y }})
        const hearth = new TexRegion({ frame: "hearth", overlay: "none" })
        const hearthBg = new TexRegion({ frame: "hearthbg", overlay: "none", pos: { x: 32, y: 48 } })
        this.add(hearthBg)
        this.add(hearth)
    }
}

export default Hearth