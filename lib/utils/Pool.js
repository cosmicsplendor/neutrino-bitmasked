class Pool {
    constructor({ factory, size, free, reset }) {
        this.factory = factory
        this.size = size
        this.free = free
        this.reset = reset
        this.list = Array(size).fill(false)
        this.lastIdx = 0
    }
    create(...params) {
        this.lastIdx = (this.lastIdx + 1) % this.list.length
        if (!this.list[this.lastIdx]) { 
            this.list[this.lastIdx] = this.factory(...params)
        } else { 
            this.reset && this.reset(this.list[this.lastIdx], ...params)
            this.free && this.free(this.list[this.lastIdx])
        }
        const obj = this.list[this.lastIdx]
        
        return obj
    }
}

export default Pool