import {  BiomeGen } from "@lib/utils/index.js"

class Industrial extends BiomeGen {
    height=4
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Construction", 1)
        this.addTransition("Suburb", 1)
        const { objGraph: graph } = this
        graph.addNodes([
           "ct_fac1", // big factory
           "ct_fac1_flipped", // big factory
           "kiln", // thin kiln
           "kiln_dupe1", // thin kiln
           "pole", // electricity piole 
           "sb_haus1", // "foliage4" ssmall like a bush
           "bush", // "foliage4" ssmall like a bush
           "tree4"
        ])

        graph.addInitialNode("bush")


        graph.addEdge("bush", "ct_fac1_flipped", 24)

        graph.addEdge("ct_fac1_flipped", "ct_fac1")
        graph.addEdge("ct_fac1", "kiln", [6, 16])
        
        graph.addEdge("kiln", "kiln_dupe1", 28)
        graph.addEdge("kiln_dupe1", "tree4", 42)
        graph.addEdge("tree4", "sb_haus1", 32)

    }
}

export default Industrial