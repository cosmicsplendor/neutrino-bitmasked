import {  BiomeGen } from "@lib/utils/index.js"

class Japan extends BiomeGen {
    height=5
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Exotica", 1)
        const { objGraph: graph } = this
        graph.addNodes([
            "jp_tmpl_flipped",
            "jp_tmpl",
            "jp_gate",
            "jp_gate_flipped",
            "jp_tree",
            "jp_tree_flipped",
            "tree3",
            "tree3_flipped",
        ])

        graph.setInitialNode("jp_tree_flipped")

        graph.addEdge("jp_tmpl_flipped", "jp_tmpl", 0)
        graph.addEdge("jp_gate", "jp_gate_flipped", 0)

        graph.addEdge("jp_tree_flipped", "jp_gate", 16)

        graph.addEdge("jp_gate_flipped", "tree3", [24, 32])
        graph.addEdge("jp_gate_flipped", "jp_tree", 16)

        graph.addEdge("tree3", "tree3_flipped", -30)
        graph.addEdge("tree3_flipped", "jp_tmpl_flipped", 43)
        graph.addEdge("tree3", "jp_tmpl_flipped", 43)
    }
}

export default Japan