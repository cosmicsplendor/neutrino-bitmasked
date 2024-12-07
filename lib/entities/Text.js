import Node from "./Node"
import { text } from "./types"

class Text extends Node {
    constructor({ color = "white", size = "20pt", value = "Null Text", ...nodeProps } = {}) {
        super({ ...nodeProps })
        this.color = color
        this.size = size
    }
}

export default Text