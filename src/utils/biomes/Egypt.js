import {  BiomeGen } from "@lib/utils/index.js"

class Egypt extends BiomeGen {
    height=3
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Egypt", 1)
        const { objGraph: graph } = this
        graph.addNodes([
            "eg_art",
            "eg_cacti",
            "eg_plr",
            "eg_puma",
            "eg_pyramid",
            "eg_pyramid_flipped",
            "eg_shrub",
            "eg_shrub_flipped",
            "bush",
            "eg_statue",
            "eg_tomb",
            "eg_tomb_flipped",
            "eg_vsl",
            "palm1",
            "eg_gate1",
            "eg_gate2",
            "eg_gate1_flipped",
            "eg_gate2_flipped",
        ])
        graph.setInitialNode("eg_gate2")
        graph.chain(["eg_gate2", "eg_gate1", "eg_gate1_flipped", "eg_gate2_flipped"])
        graph.addEdge("eg_gate2_flipped", "eg_cacti", 50)
        graph.addEdge("eg_cacti", "eg_pyramid", 48)
        graph.addEdge("eg_cacti", "eg_cacti", 24, 2)
        graph.addEdge("eg_cacti", "eg_vsl", 32)

        graph.addEdge("eg_pyramid", "eg_pyramid_flipped", 0)
        graph.addEdge("eg_pyramid_flipped", "eg_pyramid", 48)
        graph.addEdge("eg_pyramid_flipped", "eg_shrub", 48)

        graph.addEdge("eg_shrub", "eg_shrub_flipped", 0)
        graph.addEdge("eg_shrub_flipped", "eg_shrub", 16)
        graph.addEdge("eg_shrub_flipped", "eg_pyramid", 48)
        graph.addEdge("eg_shrub_flipped", "eg_vsl", 32)
        graph.addEdge("eg_shrub_flipped", "eg_art", 32)
        graph.addEdge("eg_shrub_flipped", "palm1", 32, 3)

        graph.addEdge("eg_vsl", "eg_vsl", 12, 1.5)
        graph.addEdge("eg_vsl", "eg_art", 36)
        graph.addEdge("eg_art", "eg_shrub", 36)
        graph.addEdge("eg_art", "palm1", 36)

        graph.addEdge("palm1", "palm1", 26, 2)
        graph.addEdge("palm1", "eg_plr", 26)

        graph.addEdge("eg_plr", "eg_plr", 32, 1.5)
        graph.addEdge("eg_plr", "eg_puma", 32)

        graph.addEdge("eg_puma", "bush", 32)
        graph.addEdge("bush", "bush", 4, 2)
        graph.addEdge("bush", "eg_statue", 8, 2)
        graph.addEdge("bush", "eg_tomb", 12)
        
        graph.addEdge("eg_statue", "eg_statue", 20)
        graph.addEdge("eg_statue", "bush", 32)

        graph.addEdge("eg_tomb", "eg_tomb_flipped")
    }
}

export default Egypt