import {  BiomeGen } from "@lib/utils/index.js"

class Medieval extends BiomeGen {
    height=4
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Industrial", 1)
        const { objGraph: graph } = this
        graph.addNodes([
            "arch1",
            "arch2",
            "arch3",
            "arch_5",
            "btlmnt",
            "base",
            "base_dupe1",
            "sb_haus2",
            "watch_twr",
        ])
        graph.setInitialNode("btlmnt")
        graph.addEdge("btlmnt", "arch2", -15)
        graph.addEdge("arch2", "arch2", 0, 1, [1, 3])
        graph.addEdge("arch2", "base", -15)
        graph.addEdge("base", "arch2")
        graph.addEdge("arch2", "arch2")
        graph.addEdge("arch2", "sb_haus2", -6)

    }
}

export default Medieval