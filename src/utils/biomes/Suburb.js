import {  BiomeGen } from "@lib/utils/index.js"

class Suburb extends BiomeGen {
    height=5
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Ruins", 1)
        const { objGraph: graph } = this
        graph.addNodes([
            "tree2",
            "tree2_flipped",
            "tower",
            "sb_mill",
            "sb_mill_flipped",
            "sb_haus1",
            "sb_haus2",
            "pole",
            "bush"
        ])

        graph.addInitialNode("tower")
        graph.addEdge("tree2_flipped", "tree2")

        graph.addEdge("tower", "tree2_flipped", 80)
        graph.addEdge("tower", "sb_haus1", 72)
        graph.addEdge("tower", "sb_mill_flipped", 72)
        graph.addEdge("sb_mill_flipped", "sb_haus1", 36)
        graph.addEdge("sb_haus1", "sb_haus1", 6, 1, [1, 2])
        graph.addEdge("sb_haus1", "tree2_flipped", 46)

        graph.addEdge("tree2", "sb_mill", 54)
        graph.addEdge("tree2", "pole", 12)
        graph.addEdge("tree2", "pole", 12)
        graph.addEdge("pole", "sb_haus2", 20)
        graph.addEdge("sb_haus2", "bush", 4)
        graph.addEdge("bush", "sb_mill", 54)

    }
}

export default Suburb