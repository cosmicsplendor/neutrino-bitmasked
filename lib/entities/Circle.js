import Node from "./Node"
import { circle } from "./types"

class Circle extends Node {
    constructor({ radius=30, fill, stroke="red", ...nodeProps} = {}) {
        super({ ...nodeProps })
        this.radius = radius
        this.fill = fill
        this.stroke = stroke
        this.type = circle
    }
}

export default Circle