import {  BiomeGen } from "@lib/utils/index.js"

class Japan extends BiomeGen {
    height=4
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
            "tree3"
        ])

        graph.setInitialNode("jp_tree_flipped")

        graph.addEdge("jp_tmpl_flipped", "jp_tmpl", 0)
        graph.addEdge("jp_gate", "jp_gate_flipped", 0)

        graph.addEdge("jp_tree_flipped", "jp_gate", [30, 60])
        graph.addEdge("jp_gate_flipped", "tree3", 43)
        graph.addEdge("tree3", "jp_tmpl_flipped", 43)
    }
}

export default Japan