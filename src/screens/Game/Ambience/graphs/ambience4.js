import SoundGraph from "../SoundGraph";

const graph = new SoundGraph({ initialSilence: false })

graph.addNode("rain")

graph.addEdge("rain", "rain", 1, 0)

graph.commit()

export default graph