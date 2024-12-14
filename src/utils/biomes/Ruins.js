import {  BiomeGen } from "@lib/utils/index.js"

class Ruins extends BiomeGen {
    height=5
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Exotica", 1)
        const { objGraph: graph } = this
        graph.addNodes([
            "ruin_1",
            "ruin_2",
            "ruin_3",
            "ruin_3_flipped",
            "palm0",
            "palm1",
            "tree4"
        ])

        graph.addInitialNode("palm1")

        graph.addEdge("palm1", "ruin_1", 40, 1)
        graph.addEdge("palm1", "ruin_3_flipped", -12, 1)
        graph.addEdge("ruin_3_flipped", "ruin_1", 40, 1)

        graph.addEdge("ruin_1", "ruin_1", 8, 1, 2)
        graph.addEdge("ruin_1", "ruin_2", 38, 1)

        graph.addEdge("ruin_2", "tree4", 38, 0.25)
        graph.addEdge("ruin_2", "palm0", -16, 0.25)
        graph.addEdge("tree4", "tree4", -12, 1, 2)
        graph.addEdge("palm0", "tree4", 24)
        graph.addEdge("tree4", "ruin_3", 38)
        graph.addEdge("palm0", "ruin_3", 48)

    }
}

export default Ruins