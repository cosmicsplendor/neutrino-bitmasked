import {  BiomeGen } from "@lib/utils/index.js"

class Medieval extends BiomeGen {
    height=4
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Industrial", 1)
        const { objGraph: graph } = this
        graph.addNodes([
            "arch1_flipped",
            "arch2",
            "arch3",
            "arch_5",
            "btlmnt",
            "btlmnt_dupe1",
            "base_dupe1",
            "watch_twr",
            "watch_twr_dupe1",
            "watch_twr_dupe2",
            "watch_twr_dupe3",
            "tree1",
            "tree3",
            "bush",
        ])
        graph.addInitialNode("arch1_flipped")

        graph.addEdge("arch1_flipped", "btlmnt", -16)

        graph.addEdge("btlmnt", "arch2", -15)
        graph.addEdge("arch2", "arch2", 0, 1, [2, 3])

        graph.addEdge("arch2", "btlmnt_dupe1", -16)
        graph.addEdge("watch_twr", "arch_5", -8)

        graph.addEdge("btlmnt_dupe1", "arch_5", -15)
        graph.addEdge("watch_twr_dupe2", "arch_5", -15)
        graph.addEdge("arch_5", "arch_5", 0, 1, [5, 6])
        graph.addEdge("arch_5", "watch_twr_dupe1", -8)
        graph.addEdge("arch_5", "watch_twr_dupe2", -16, 0.1)

        graph.addEdge("watch_twr_dupe1", "arch3", -29)
        graph.addEdge("arch3", "arch3", -20, 1, 1)
        graph.addEdge("arch3", "watch_twr_dupe3", -29)

        graph.addEdge("watch_twr_dupe1", "bush", 24)
        graph.addEdge("watch_twr_dupe3", "bush", 24)
        graph.addEdge("bush", "tree1", -8)

    }
}

export default Medieval