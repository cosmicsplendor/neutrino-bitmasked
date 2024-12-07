const getDims = require("../utils/getDims")
const { alignmentMap } = require("./alignment")

const blades = [
    "gearBlade", "spikeBlade", "buttonBlade",
    "gearBladeS", "spikeBladeS", "buttonBladeS",
]

const applyOffsets = async (x, y, name, alignment, props) => {
    if (blades.includes(name)) {
        const dims = await getDims(name, props)
        const [ xAlignment, yAlignment ] = alignmentMap[alignment]
        const halfWidth = dims.width * 0.5
        const halfHeight = dims.height * 0.5
        const dx = xAlignment === "left" ? -halfWidth: (xAlignment === "right" ? halfWidth: 0)
        const dy = yAlignment === "top" ? -halfHeight: (yAlignment === "bottom" ? halfHeight: 0)
        return { x: x + dx, y: y + dy }
    }
    if (name === "orb") {
        return { x: x + 21, y: y + 21 }
    }
    return {x, y}
}

module.exports = applyOffsets