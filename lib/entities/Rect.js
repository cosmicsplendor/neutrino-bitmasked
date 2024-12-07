import Node from "./Node"
import { rect } from "./types"

class Rect extends Node {
    constructor({ width, height, fill, stroke, strokeWidth, alpha, ...nodeProps }) {
        super({ ...nodeProps })
        this.width = width
        this.height = height
        this.fill = fill
        this.stroke = stroke
        this.strokeWidth = strokeWidth
        this.alpha = alpha
        this.type = rect
    }
}

export default Rect