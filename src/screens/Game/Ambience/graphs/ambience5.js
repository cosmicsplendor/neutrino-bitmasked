import SoundGraph from "../SoundGraph";

const graph = new SoundGraph()

graph.addNode("wind_1")
graph.addNode("wind_2")
graph.addNode("flute_amb")
graph.addNode("creepy")


graph.addEdge("creepy", "wind_1")
graph.addEdge("creepy", "wind_2")
graph.addEdge("flute_amb", "wind_1")
graph.addEdge("flute_amb", "wind_2")

graph.addEdge("wind_1", "creepy")
graph.addEdge("wind_1", "flute_amb")
graph.addEdge("wind_2", "creepy")
graph.addEdge("wind_2", "flute_amb")

graph.commit()

export default graph