import SoundGraph from "../SoundGraph";

const graph = new SoundGraph()

graph.addNode("melody")

graph.addEdge("melody", "melody", 1, 0)

graph.commit()

export default graph