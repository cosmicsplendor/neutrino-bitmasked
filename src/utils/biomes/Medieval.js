import {  BiomeGen } from "@lib/utils/index.js"

class Medieval extends BiomeGen {
    height=4
    constructor(stateMachine, dimsMap) {
        super(stateMachine, dimsMap);
        // TODO add transitions
        this.addTransition("Industrial", 1)
        const { objGraph: graph } = this
        graph.addNodes([
            "arch1",
            "arch2",
            "arch3",
            "arch_5",
            "btlmnt",
            "btlmnt_dupe1",
            "base",
            "base_dupe1",
            "watch_twr",
            "watch_twr_dupe1",
        ])
        graph.setInitialNode("btlmnt")
        graph.addEdge("btlmnt", "arch2", -15)
        graph.addEdge("arch2", "arch2", 0, 1, [1, 3])
        graph.addEdge("arch2", "watch_twr", -8)  
        graph.addEdge("arch2", "base", -8)  
        graph.addEdge("arch2", "btlmnt_dupe1", -16)  
        graph.addEdge("watch_twr", "arch_5", -8)  
        graph.addEdge("base", "arch_5")  
        graph.addEdge("btlmnt_dupe1", "arch_5", -15)  
        graph.addEdge("arch_5", "arch_5", 0, 1, [6, 9])  
        graph.addEdge("arch_5", "watch_twr_dupe1", -8)  
        graph.addEdge("arch_5", "btlmnt_dupe1", -16)  
        // graph.addEdge("watch_twr_dupe1", "arch3", -8)  
        // graph.addEdge("arch3", "arch3", 0, 1, 3)  

    }
}

export default Medieval