const { calcAligned, convertToWorld } = require("../utils/index.js");
const getDims = require("../utils/getDims.js")

const alignmentMap = {
    "top-left": ["left", "top"],
    "bottom-left": ["left", "bottom"],
    "top": ["center", "top"],
    "bottom": ["center", "bottom"],
    "top-right": ["right", "top"],
    "bottom-right": ["right", "bottom"],
    "center": ["center", "center"],
    "left": ["left", "center"],
    "right": ["right", "center"]
}

const align = async (name, projection, alignment, props) => {
    const [alignX, alignY] = alignmentMap[alignment]
    const dims = await getDims(name, props)
    const aligned = calcAligned(convertToWorld(projection), { w: dims.width, h: dims.height }, alignX, alignY)
    return aligned
}

module.exports = {
    align,
    alignmentMap,
    validAlignments: Object.keys(alignmentMap)
}