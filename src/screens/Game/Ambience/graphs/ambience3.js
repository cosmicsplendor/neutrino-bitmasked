import SoundGraph from "../SoundGraph";

const graph = new SoundGraph()

graph.addNode("g_solo_1")
graph.addNode("g_solo_2")
graph.addNode("g_solo_3")
graph.addNode("wind_1")
graph.addNode("wind_2")
graph.addNode("wind_3")
graph.addNode("flute_amb_1")
graph.addNode("flute_amb_2")
graph.addNode("creepy")

graph.addEdge("g_solo_3", "flute_amb_1")
graph.addEdge("g_solo_3", "wind_3")

graph.addEdge("flute_amb_1", "creepy")
graph.addEdge("wind_3", "creepy")

graph.addEdge("creepy", "wind_1")
graph.addEdge("creepy", "g_solo_1")

graph.addEdge("wind_1", "g_solo_3")
graph.addEdge("wind_1", "g_solo_1", 2)

graph.addEdge("g_solo_1", "g_solo_2", 1, 0)

graph.addEdge("g_solo_2", "wind_2")
graph.addEdge("g_solo_2", "flute_amb_2")

graph.addEdge("wind_2", "g_solo_3")
graph.addEdge("flute_amb_2", "g_solo_3")

graph.excludeRandom("g_solo_2")
graph.commit()

export default graph