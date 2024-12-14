import {  BiomeGen } from "@lib/utils/index.js"

class Suburb extends BiomeGen {
    height=5
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Medieval", 1)
        const { objGraph: graph } = this
        graph.addNodes([
            "tree2",
            "tree2_flipped",
            "tower",
            "sb_mill",
            "sb_mill_flipped",
            "sb_haus1",
            "sb_haus1_dupe1",
            "pole",
            "tree3"
        ])

        graph.addInitialNode("tower")
        graph.addEdge("tree2_flipped", "tree2")

        graph.addEdge("tower", "tree2_flipped", 80)
        graph.addEdge("tower", "sb_haus1", 36)
        graph.addEdge("tower", "sb_mill_flipped", 72)
        graph.addEdge("sb_mill_flipped", "sb_haus1", 16)
        graph.addEdge("sb_haus1", "sb_haus1", 6, 1, [1, 2])
        graph.addEdge("sb_haus1", "tree2_flipped", 46)

        graph.addEdge("tree2", "sb_mill", 54)
        graph.addEdge("tree2", "pole", [36, 46])
        graph.addEdge("pole", "sb_haus1_dupe1", 12)
        graph.addEdge("sb_haus1_dupe1", "tree3", 4)
        graph.addEdge("tree3", "sb_mill", 54)

    }
}

export default Suburb