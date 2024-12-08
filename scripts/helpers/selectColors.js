const { pickOne, rand } = require("../utils")

const originalColors = [
    { "bg": "#112237", "pxbg": "#08111b", "tint": "0.01, -0.01, -0.005, 0" },
    { "bg": "#121228", "pxbg": "#0f0f22", "tint": "0.025, -0.025, -0.025, 0" },
    { "bg": "#121228", "pxbg": "#0f0f22", "tint": "0.025, -0.025, -0.025, 0" },
    { "bg": "#222235", "pxbg": "#151525", "tint": "0.065, -0.025, 0.000, 0" },
    { "bg": "#102728", "pxbg": "#172629", "tint": "0.1, 0.05, 0.025" },
    { "bg": "#050525", "pxbg": "#000012", "tint": "0.075, -0.025, -0.0125, 0" },
    { "bg": "#0f0f22", "pxbg": "#0a0a17", "tint": "0.025, -0.0125, -0.025, 0" },
    { "bg": "#10103a", "pxbg": "#0b0b25", "tint": "0.05,0,-0.05,0" },
    { "bg": "#132b27", "pxbg": "#0a1614", "tint": "0.025, -0.025, -0.0125, 0" },
    { "pxbg": "#121212", "bg": "#171717", "tint": "0.025, 0.0125, -0.025, 0" }
]

const aiSuggested = [
    { "bg": "#1a1a30", "pxbg": "#0e0e24", "tint": "0.035, -0.02, -0.015, 0" }, // Deep blue-black
    { "bg": "#16162e", "pxbg": "#121227", "tint": "0.05, -0.03, -0.01, 0" },    // Midnight blue
    { "bg": "#1e2427", "pxbg": "#0c1014", "tint": "0.03, -0.02, -0.01, 0" },    // Charcoal grey-blue
    { "bg": "#101822", "pxbg": "#0c121a", "tint": "0.03, 0, -0.03, 0" },        // Smokey blue-grey
    { "bg": "#0b1a1e", "pxbg": "#030d12", "tint": "0.025, -0.02, -0.02, 0" },   // Cool dark cyan -corected
    { "bg": "#20202d", "pxbg": "#10101d", "tint": "0.04, -0.03, -0.02, 0" },     // Shadowed navy - level16
    { "bg": "#202033", "pxbg": "#181828", "tint": "0.04, -0.02, -0.015, 0" },
    { "bg": "#1c1c40", "pxbg": "#101029", "tint": "0.06, -0.01, -0.03, 0" },
    { "bg": "#162323", "pxbg": "#0a1414", "tint": "0.045, -0.02, -0.01, 0" },
    { "bg": "#232323", "pxbg": "#121212", "tint": "0.03, -0.01, -0.01, 0" }
]

const getMoon = () => {
    const placeMoon = Math.random() < 0.75
    if (!placeMoon) return {}
    const x = rand(10, 90)
    const y = rand(10, 65)
    return {
        bgPos: `${x}% ${y}%`
    }
}

const selectColors = () => {
    const handcrafted = Math.random() < 0.65
    if (handcrafted) {
        return pickOne(originalColors)
    }
    const colors = pickOne(aiSuggested)
    const moon = getMoon()
    return { ...colors, ...moon }
}

module.exports = selectColors