import {  BiomeGen } from "@lib/utils/index.js"

class Exotica extends BiomeGen {
    height=2
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Ruins", 1)
        const { objGraph: graph } = this
        graph.addNodes([
           "tree4",
           "m_tmpl",
           "m_tmpl_flipped",
           "tree4",
           "palm0",
           "palm0_dupe1",
           "palm1",
           "ex_plr",
           "ex_plr_flipped",
           "arch1_flipped"
        ])

        graph.addInitialNode("ex_plr")

        graph.addEdge("m_tmpl_flipped", "m_tmpl", 0)


        graph.addEdge("ex_plr", "palm0", 44)
        graph.addEdge("palm0", "palm1", [-24, 2], 0.75)
        graph.addEdge("palm1", "palm0_dupe1", [-32, 4])

        graph.addEdge("palm0", "m_tmpl_flipped", [24, 32])
        graph.addEdge("palm0_dupe1", "m_tmpl_flipped", [24, 32])
        graph.addEdge("palm1", "m_tmpl_flipped", [24, 32])
        console.log(graph.nodes.get("palm1"))

        graph.addEdge("m_tmpl", "tree4", 18)
        graph.addEdge("m_tmpl", "ex_plr_flipped", 56)
        graph.addEdge("tree4", "m_tmpl_flipped", 40, 0.15)
        graph.addEdge("tree4", "ex_plr_flipped", 56)
    }
}

export default Exotica