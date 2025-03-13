import SoundGraph from "../SoundGraph";

const graph = new SoundGraph()

graph.addNode("guitar")

graph.addEdge("guitar", "guitar", 1, 0)

graph.commit()

export default graph