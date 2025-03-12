import SoundGraph from "../SoundGraph";

const graph = new SoundGraph()

graph.addNode("chill")

graph.addEdge("chill", "chill", 1, 0)

graph.commit()

export default graph