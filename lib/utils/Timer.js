import { Node } from "@lib"

class Timer extends Node {
    static attachedTo(node) {
        return props => {
            return node.add(new Timer(props))
        }
    }
    constructor(duration, onTick, onDone, delay = 0) {
        super()
        this.invisible = true
        this.delay = delay
        this.duration = duration
        this.elapsed = 0
        this.onTick = onTick
        this.onDone = onDone
    }
    update(dt) {
        if (this.delay > 0) {
            this.delay -= dt
            return
        }
        this.elapsed += dt
        if (this.elapsed > this.duration) {
            this.onDone && this.onDone()
            this.remove()
            return
        }
        this.onTick && this.onTick(this.elapsed / this.duration) // pass in progress as an argument
    }
}

export default Timer