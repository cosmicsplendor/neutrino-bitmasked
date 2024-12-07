import SoundGraph from "../SoundGraph";

const graph = new SoundGraph()

graph.addNode("mel4")
graph.addNode("creepy")
graph.addNode("wind_1")
graph.addNode("wind_2")

graph.addEdge("mel4", "wind_2", 1)
graph.addEdge("mel4", "wind_1", 1)
graph.addEdge("mel4", "creepy", 2)

graph.addEdge("creepy", "wind_1", 1.5)
graph.addEdge("creepy", "wind_2", 1)

graph.addEdge("wind_1", "mel4")
graph.addEdge("wind_2", "mel4")

graph.commit()

export default graph