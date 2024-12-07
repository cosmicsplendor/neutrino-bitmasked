const { CompositeBlock, Map, Block } = require("./utils/index");

// Initialize the map with a configuration object
const map = new Map({
    width: 60,
    height: 20,
    background: "#132b27",
    mobileBackground: "#132b27",
    pixelBackground: "#0a1614",
    tint: { r: 0.025, g: -0.025, b: -0.0125, a: 0 },
    floorHeight: 2
});

// Create and add the left boundary
const leftBound = CompositeBlock.create({ width: 1, height: 8 })
    .addPart({ width: 2, height: 3, position: "right-end", onto: "last" })
    .stackOn(map.floor, { position: "top-start" })
    .addToMap();

// Create and add block b1
const b1 = CompositeBlock.create({ width: 3, height: 3 })
    .stackOn(leftBound, { position: "right-end", dx: 8 })
    .addToMap();

// Create and add block b3 with additional parts
const b3 = CompositeBlock.create({ width: 9, height: 2 })
    .addPart({ width: 4, height: 3, position: "top" })
    .addPart({ width: 4, height: 4, position: "bottom-end" })
    .stackOn(b1, { position: "right-end", dx: 2 })
    .addToMap();

// Print the map as ASCII
map.printAscii();

// map.spawnPoints.push({ name: "player", coords: calcStacked(leftBound, undefined, "right-start")})
// map.printAsciiScaled()
// map.exportMap("testlevel")