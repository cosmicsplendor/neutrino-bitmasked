import {  BiomeGen } from "@lib/utils/index.js"

class Egypt extends BiomeGen {
    height=2
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Egypt", 1)
        const { objGraph: graph } = this
        graph.addNodes([
            "eg_art",
            "eg_cacti",
            "eg_cacti2",
            "eg_plr",
            "eg_puma",
            "eg_pyramid",
            "eg_pyramid_flipped",
            "eg_shrub",
            "eg_shrub_flipped",
            "bush",
            "eg_statue_flipped",
            "eg_vsl",
            "palm0",
            "palm1",
            "eg_gate1",
            "eg_gate2",
            "eg_gate1_flipped",
            "eg_gate2_flipped",
            "arch1",
            "arch1_flipped"
        ])
        graph.setInitialNode("arch1")
        graph.chain(["eg_gate2", "eg_gate1", "eg_gate1_flipped", "eg_gate2_flipped"])
        graph.addEdge("eg_pyramid", "eg_pyramid_flipped", 0)
        graph.addEdge("eg_shrub", "eg_shrub_flipped", 0)

        graph.addEdge("arch1", "eg_gate2", [40, 60])

        graph.addEdge("eg_pyramid_flipped", "palm0", 24)
        graph.addEdge("eg_pyramid_flipped", "bush", 24, 1.5)
        graph.addEdge("eg_pyramid_flipped", "eg_shrub", 24, 1.5)
        graph.addEdge("eg_pyramid_flipped", "palm1", [24, 56])
        graph.addEdge("eg_pyramid_flipped", "eg_pyramid", [-40, 20])

        graph.addEdge("eg_shrub_flipped", "eg_vsl")
        graph.addEdge("eg_vsl", "eg_pyramid", 14)
        graph.addEdge("eg_vsl", "eg_vsl", 10)

        graph.addEdge("palm0", "palm0", [-25, 12], 0.5)
        graph.addEdge("palm0", "palm1", [-25, 12], 0.5)
        graph.addEdge("palm1", "palm0", [-25, 12], 0.5)
        graph.addEdge("palm1", "eg_plr", 16)
        graph.addEdge("palm0", "eg_puma", [-12, 0])
        graph.addEdge("palm1", "eg_puma", [-20, 0])

        graph.addEdge("eg_plr", "eg_plr", 10, 0.5)
        graph.addEdge("eg_plr", "bush", [40, 60])

        graph.addEdge("bush", "eg_statue_flipped", 15)
        graph.addEdge("bush", "eg_vsl", 15)
        graph.addEdge("bush", "bush", [-10, -4], 0.5)
        graph.addEdge("bush", "eg_cacti", [30, 40], 0.5)
        graph.addEdge("bush", "eg_pyramid", [12, 24], 0.5)
        graph.addEdge("eg_statue_flipped", "eg_statue_flipped", 10, 0.6)
        graph.addEdge("eg_statue_flipped", "eg_art", 40, 0.6)
        graph.addEdge("eg_statue_flipped", "eg_pyramid", 40)


        graph.addEdge("eg_puma", "eg_cacti", 28)
        graph.addEdge("eg_cacti", "palm0", 40)
        graph.addEdge("eg_pyramid_flipped", "eg_cacti", 17)
        graph.addEdge("eg_cacti", "eg_cacti2", 5, 0.5)
        graph.addEdge("eg_cacti2", "eg_cacti", [26, 40], 0.5)
        graph.addEdge("eg_cacti2", "eg_gate2", 50)
        
        graph.addEdge("eg_gate2_flipped", "bush", [30, 50])

        graph.addEdge("eg_puma", "eg_art", 75)
    }
}

export default Egypt