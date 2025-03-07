const { pickOne, rand } = require("../utils")

// Original colors for reference (commented out)
// const originalColors = [
//     { "bg": "#112237", "pxbg": "#08111b", "tint": "0.01, -0.01, -0.005, 0" },
//     { "bg": "#121228", "pxbg": "#0f0f22", "tint": "0.025, -0.025, -0.025, 0" },
//     { "bg": "#121228", "pxbg": "#0f0f22", "tint": "0.025, -0.025, -0.025, 0" },
//     { "bg": "#222235", "pxbg": "#151525", "tint": "0.065, -0.025, 0.000, 0" },
//     { "bg": "#050525", "pxbg": "#000012", "tint": "0.075, -0.025, -0.0125, 0" },
//     { "bg": "#0f0f22", "pxbg": "#0a0a17", "tint": "0.025, -0.0125, -0.025, 0" },
//     { "bg": "#10103a", "pxbg": "#0b0b25", "tint": "0.05,0,-0.05,0" },
//     { "bg": "#132b27", "pxbg": "#0a1614", "tint": "0.025, -0.025, -0.0125, 0" },
//     { "pxbg": "#121212", "bg": "#171717", "tint": "0.025, 0.0125, -0.025, 0" }
// ]

// Balanced colors - darker than previous suggestion but lighter than originals
const balancedOriginalColors = [
    { "bg": "#2a4670", "pxbg": "#182840", "tint": "0.01, -0.01, -0.005, 0" },
    { "bg": "#2a2a55", "pxbg": "#1d1d40", "tint": "0.025, -0.025, -0.025, 0" },
    { "bg": "#2a2a55", "pxbg": "#1d1d40", "tint": "0.025, -0.025, -0.025, 0" },
    { "bg": "#3d3d60", "pxbg": "#282845", "tint": "0.065, -0.025, 0.000, 0" },
    { "bg": "#22224f", "pxbg": "#15153d", "tint": "0.075, -0.025, -0.0125, 0" },
    { "bg": "#27274a", "pxbg": "#1a1a35", "tint": "0.025, -0.0125, -0.025, 0" },
    { "bg": "#2a2a75", "pxbg": "#1d1d55", "tint": "0.05,0,-0.05,0" },
    { "bg": "#295652", "pxbg": "#1c3d3a", "tint": "0.025, -0.025, -0.0125, 0" },
    { "bg": "#3a3a3a", "pxbg": "#252525", "tint": "0.025, 0.0125, -0.025, 0" }
]

// AI suggested colors with balanced adjustments
const balancedAiSuggested = [
    { "bg": "#3a3a70", "pxbg": "#2a2a55", "tint": "0.035, -0.02, -0.015, 0" }, // Deep blue
    { "bg": "#35356c", "pxbg": "#252550", "tint": "0.05, -0.03, -0.01, 0" },    // Midnight blue
    { "bg": "#414b5c", "pxbg": "#2a3240", "tint": "0.03, -0.02, -0.01, 0" },    // Charcoal grey-blue
    { "bg": "#304055", "pxbg": "#203040", "tint": "0.03, 0, -0.03, 0" },        // Smokey blue-grey
    { "bg": "#274a55", "pxbg": "#183540", "tint": "0.025, -0.02, -0.02, 0" },   // Cool cyan
    { "bg": "#3f3f65", "pxbg": "#2d2d50", "tint": "0.04, -0.03, -0.02, 0" },    // Shadowed navy
    { "bg": "#3a3a70", "pxbg": "#2d2d58", "tint": "0.04, -0.02, -0.015, 0" },
    { "bg": "#35357f", "pxbg": "#282865", "tint": "0.06, -0.01, -0.03, 0" },
    { "bg": "#345555", "pxbg": "#254040", "tint": "0.045, -0.02, -0.01, 0" },
    { "bg": "#474747", "pxbg": "#353535", "tint": "0.03, -0.01, -0.01, 0" }
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