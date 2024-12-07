import Observable from "@lib/utils/Observable";

class State extends Observable {
    name = null // starting with null state before any state transition call
    level = 1
    elapsed = 0
    constructor() {
        super([ "pause", "over", "play", "complete", "halt" ])
    }
    set(n) {
        this.name = n
    }
    is(n) {
        return n === this.name
    }
    pause() {
        if (this.is("paused")) return
        this.emit("pause")
        this.set("paused")
    }
    play() {
        if (this.is("playing")) return
        this.emit("play")
        this.set("playing")
    }
    over(x) { // at what x-coordinates did the player die
        if (this.is("over")) return
        this.emit("over", x)
        this.set("over")
    }
    complete(curTime, bestTime) {
        if (this.is("completed")) return
        this.emit("complete", curTime, bestTime)
        this.set("completed")
    }
    halt() {
        if (this.is("halted")) return
        this.set("halted")
        this.emit("halt")
    }
}

export default State