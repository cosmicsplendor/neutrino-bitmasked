import SoundGraph from "../SoundGraph";

const graph = new SoundGraph()

graph.addNode("mel3")
graph.addNode("wind_1")
graph.addNode("wind_2")
graph.addNode("wind_3")
graph.addNode("flute_amb_1")
graph.addNode("flute_amb_2")
graph.addNode("creepy")

graph.addEdge("mel3", "creepy")


graph.addEdge("creepy", "wind_1", 4)
graph.addEdge("creepy", "wind_2")
graph.addEdge("creepy", "wind_3")
graph.addEdge("creepy", "flute_amb_1")
graph.addEdge("creepy", "flute_amb_2")

graph.addEdge("wind_2", "mel3")
graph.addEdge("wind_3", "mel3")
graph.addEdge("flute_amb_1", "mel3")
graph.addEdge("flute_amb_2", "mel3")
graph.addEdge("wind_1", "mel3")

graph.commit()

export default graph