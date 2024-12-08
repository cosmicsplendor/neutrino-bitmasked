const { pickOne, rand } = require("../utils")

const originalColors = [
    { "bg": "#112237", "pxbg": "#08111b", "fg": "#05080f" },
    { "bg": "#121228", "pxbg": "#0f0f22", "fg": "#0c0c1a" },
    { "bg": "#121228", "pxbg": "#0f0f22", "fg": "#0c0c1a" },
    { "bg": "#222235", "pxbg": "#151525", "fg": "#0e0e18" },
    { "bg": "#102728", "pxbg": "#172629", "fg": "#0d1213" },
    { "bg": "#0a102a", "pxbg": "#14141d", "fg": "#0b0b13" },
    { "bg": "#0f0f22", "pxbg": "#0a0a17", "fg": "#06060d" },
    { "bg": "#10103a", "pxbg": "#0b0b25", "fg": "#080815" },
    { "bg": "#132b27", "pxbg": "#0a1614", "fg": "#07100e" },
    { "bg": "#202020", "pxbg": "#151515", "fg": "#0c0c0c" }
]

const aiSuggested = [
    { "bg": "#1a1a30", "pxbg": "#0e0e24", "fg": "#08081a" }, // Deep blue-black
    { "bg": "#16162e", "pxbg": "#121227", "fg": "#0c0c1b" },   // Midnight blue
    { "bg": "#1e2427", "pxbg": "#0c1014", "fg": "#080a0e" },   // Charcoal grey-blue
    { "bg": "#101822", "pxbg": "#0c121a", "fg": "#080a10" } ,       // Smokey blue-grey
    { "bg": "#111c20", "pxbg": "#0a1015", "fg": "#07080c" },  // Cool dark cyan - corrected
    { "bg": "#20202d", "pxbg": "#10101d", "fg": "#0b0b14" },   // Shadowed navy - level16
    { "bg": "#202033", "pxbg": "#181828", "fg": "#101019" },
    { "bg": "#1c1c40", "pxbg": "#101029", "fg": "#0a0a18" },
    { "bg": "#162323", "pxbg": "#0a1414", "fg": "#070e0e" },
    { "bg": "#232323", "pxbg": "#121212", "fg": "#0c0c0c" }
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