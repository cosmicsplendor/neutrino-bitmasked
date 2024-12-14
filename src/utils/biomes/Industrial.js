import {  BiomeGen } from "@lib/utils/index.js"

class Industrial extends BiomeGen {
    height=3
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Japan", 1)
        const { objGraph: graph } = this
        graph.addNodes([
           "ct_fac1", // big factory
           "ct_fac1_flipped", // big factory
           "ct_fac1_dupe1", // big factory
           "kiln", // thin kiln
           "pole", // electricity piole 
           "fol2", // "foliage4" ssmall like a bush
           "bush", // "foliage4" ssmall like a bush
        ])

        graph.setInitialNode("bush")


        graph.addEdge("bush", "ct_fac1_flipped", 24)

        graph.addEdge("ct_fac1_flipped", "ct_fac1")
        graph.addEdge("ct_fac1", "kiln", [32, 48])

        graph.addEdge("kiln", "fol2", 12)

        graph.addEdge("fol2", "pole", 36)
    }
}

export default Industrial