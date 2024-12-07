import SoundGraph from "../SoundGraph";

const graph = new SoundGraph()

graph.addNode("jingl_1", [1,2])
graph.addNode("flute_amb_1")
graph.addNode("flute_amb_2")
graph.addNode("wind_1")
graph.addNode("wind_2")
graph.addNode("wind_3")
graph.addNode("creepy")

graph.addEdge("jingl_1", "flute_amb_1")
graph.addEdge("jingl_1", "flute_amb_2")

graph.addEdge("flute_amb_1", "wind_3")
graph.addEdge("flute_amb_2", "wind_2")

graph.addEdge("wind_2", "jingl_1")
graph.addEdge("wind_3", "jingl_1")

graph.addEdge("jingl_1", "wind_1")

graph.addEdge("wind_1", "creepy")
graph.addEdge("creepy", "jingl_1")

graph.commit()

export default graph