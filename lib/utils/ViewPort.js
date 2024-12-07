import Observable from "@utils/Observable"

class Viewport extends Observable {
    x = 0
    y = 0
    constructor(computeViewport) {
        super([ "change" ], computeViewport())
        window.addEventListener("resize", () => {
            const newDimensions = computeViewport()
            Object.assign(this, newDimensions)
            this.emit("change", this)
        })
    }
}

export default Viewport