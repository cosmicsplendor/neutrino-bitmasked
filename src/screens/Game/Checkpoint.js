class Checkpoint {
    maxX=0
    constructor(checkpoints = []) {
        this.checkpoints = checkpoints.sort((a, b) => a.x - b.x) // sorting in ascending order of x-coordinates
    }
    updateX(val) {
        this.maxX = Math.max(this.maxX, val)
    }
    reset() {
        this.maxX = 0
    }
    get() {
        if (this.checkpoints.length === 0) return
        const checkpoint = this.checkpoints.findLast(point => {
            return this.maxX >= point.x
        })
        return checkpoint
    }
}

export default Checkpoint