import {  BiomeGen } from "@lib/utils/index.js"

class Construction extends BiomeGen {
    height=6
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Suburb", 1)
        const { objGraph: graph } = this
        graph.addNodes([
            "ct_lmark",
            "ct_sca1_flipped",
            "ct_lmark_flipped",
            "ct_sca2_flipped",
            "ct_sca1",
            "ct_sca2",
            "tree1",
            "tree1_dupe1",
            "sb_haus2",
            "bush",
            "tree3",
            "pole",
            "fol2"
        ])

        graph.addInitialNode("tree3")

        graph.addEdge("ct_sca1_flipped", "ct_sca1", 0)
        graph.addEdge("ct_sca2", "ct_sca2_flipped", 0)
        graph.addEdge("ct_lmark", "ct_lmark_flipped", 0)

        graph.addEdge("tree3", "ct_sca1_flipped", [38, 60])
        graph.addEdge("tree3", "ct_sca2", 45)

        graph.addEdge("ct_sca1", "tree1", [52, 64])
        graph.addEdge("ct_sca2_flipped", "tree1", [52, 64])

        graph.addEdge("ct_sca1", "ct_sca2", 32, 0.3)
        graph.addEdge("ct_sca2_flipped", "ct_sca1_flipped", 32, 0.3)

        graph.addEdge("tree1", "tree1_dupe1", 12)
        graph.addEdge("tree1_dupe1", "ct_lmark", 48)

        graph.addEdge("tree1", "sb_haus2", 12)
        graph.addEdge("sb_haus2", "ct_lmark", 58)
        
        graph.addEdge("ct_lmark_flipped", "fol2", 44)
        graph.addEdge("ct_lmark_flipped", "pole", 44)
        graph.addEdge("pole", "pole", 48, 0.25)
        graph.addEdge("pole", "bush", 32)
    }
}

export default Construction