import { randf, rand } from "@lib/utils/math"

class Ambience { // StateMachine
    constructor(graph, soundMap) {
        this.graph = graph
        this.soundMap = soundMap
        this.states = {
            "playing": new Playing(this),
            "silence": new Silence(this, graph)
        }
        this.validateGraph(graph, soundMap)
    }
    validateGraph(graph, soundMap) {
        for (const node of graph.nodes.values()) {
            if (!(node.name in soundMap)) throw new Error(`Node ${node.name} doesn't exist in sound map`)
        }
    }
    update(dt) {
        this.state && this.state.update(dt)
    }
    getSound(name) {
        return this.soundMap[name]
    }
    getNextNode(curNode) {
        const { node, edge } = this.graph.getNext(curNode)
        const silence = Array.isArray(edge.silence)? randf(edge.silence[1], edge.silence[0]): edge.silence
        return { nextNode: node, silence: typeof silence === "number" && !Number.isNaN(silence) ? silence: rand(16, 8) }
    }
    getNodeInfo(node) {
        const sound = this.soundMap[node.name]
        const loops = (Array.isArray(node.loop) ? rand(node.loop[1], node.loop[0]): node.loop)
        return { sound, loops }
    }
    switchState(name, ...props) {
        this.state = this.states[name]
        this.state.onEnter(...props)
    }
    init() {
        if (this.graph.initialSilence) {
            this.switchState("silence", { nextNode: this.graph.getRandom(), silence: rand(6, 3) })
        } else {
            this.switchState("playing", this.graph.getRandom())
        }
    }
    terminate() {
        if (this.state === this.states.playing) {
            this.states.playing.sound.pause()
        }
        this.state = null
    }
}

class Silence {
    constructor(ambience) {
        this.ambience = ambience
    }
    onEnter(props) {
        const { nextNode, silence } = props
        this.t = silence
        this.nextNode = nextNode
    }
    update(dt) {
        this.t -= dt
        if (this.t < 0) {
            this.ambience.switchState("playing", this.nextNode)
        }
    }
}

class Playing {
    constructor(ambience) {
        this.ambience = ambience
    }
    onEnter(node) {
        this.node = node
        const { sound, loops } = this.ambience.getNodeInfo(node)
        this.loops = loops
        this.sound = sound
        this.sound.play()
    }
    update() {
        if (this.sound.playing) return
        // the current sound has finished playing
        if (this.loops < 1) {
            this.ambience.switchState("silence", this.ambience.getNextNode(this.node))
            return
        }
        this.loops--
        this.sound.play()
    }
}

export default Ambience