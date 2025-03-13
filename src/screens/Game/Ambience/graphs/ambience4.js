import SoundGraph from "../SoundGraph";

const graph = new SoundGraph()

graph.addNode("rain")

graph.addEdge("rain", "rain", 1, 0)

graph.commit()

export default graph