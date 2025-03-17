const { pickOne, rand } = require("../utils")

// Original colors for reference (commented out)
// const originalColors = [
//     { "bg": "#112237", "pxbg": "#08111b", },
//     { "bg": "#121228", "pxbg": "#0f0f22", },
//     { "bg": "#121228", "pxbg": "#0f0f22", },
//     { "bg": "#222235", "pxbg": "#151525", },
//     { "bg": "#050525", "pxbg": "#000012", },
//     { "bg": "#0f0f22", "pxbg": "#0a0a17", },
//     { "bg": "#10103a", "pxbg": "#0b0b25", },
//     { "bg": "#132b27", "pxbg": "#0a1614", },
//     { "pxbg": "#121212", "bg": "#171717",  }
// ]

// Balanced colors - darker than previous suggestion but lighter than originals
const balancedOriginalColors = [
    { "bg": "#2a4670", "pxbg": "#182840" },
    { "bg": "#2a2a55", "pxbg": "#1d1d40" },
    { "bg": "#2a2a55", "pxbg": "#1d1d40" },
    { "bg": "#3d3d60", "pxbg": "#282845" },
    { "bg": "#22224f", "pxbg": "#15153d" },
    { "bg": "#27274a", "pxbg": "#1a1a35" },
    { "bg": "#2a2a75", "pxbg": "#1d1d55" },
    { "bg": "#295652", "pxbg": "#1c3d3a" },
    { "bg": "#3a3a3a", "pxbg": "#252525" },
    { "bg": "#1a3c5c", "pxbg": "#0b243d" }
]

// AI suggested colors with balanced adjustments
const balancedAiSuggested = [
    { "bg": "#3a3a70", "pxbg": "#2a2a55" },
    { "bg": "#35356c", "pxbg": "#252550" },
    { "bg": "#414b5c", "pxbg": "#2a3240" },
    { "bg": "#304055", "pxbg": "#203040" },
    { "bg": "#274a55", "pxbg": "#183540" },
    { "bg": "#3f3f65", "pxbg": "#2d2d50" },
    { "bg": "#3a3a70", "pxbg": "#2d2d58", },
    { "bg": "#35357f", "pxbg": "#282865", },
    { "bg": "#345555", "pxbg": "#254040", },
    { "bg": "#474747", "pxbg": "#353535", }
]

const selectColors = () => {
    const handcrafted = Math.random() < 0.65
    if (handcrafted) {
        return pickOne(balancedOriginalColors)
    }
    const colors = pickOne(balancedAiSuggested)
    return { ...colors }
}

module.exports = selectColors