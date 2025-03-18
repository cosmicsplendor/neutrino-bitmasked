const { CompositeBlock, Block, decomposeBlocks, pickOne, rand } = require("../../utils")
const lasers = require("./lasers")
const groupMap = require("../../utils/groupMap.json")
const saws = require("./saws")
const endTiles = require("./endTiles.json")
const sawBlades = require("./sawBlades")
const stackables = require("./stackables")
const TILE_SIZE = 48
const factories = {
    player: {
        fields: [], // No specific props inferred from the original code
        create: (params) => {
            const { x, y, name } = params
            return { x, y, name }
        }
    },
    checkpoint: {
        fields: ["dy"],
        create: (params) => {
            const { x, y, dy, name } = params
            return { x, y: y + +dy * TILE_SIZE, name }
        }
    },
    orb: {
        dims: () => {
            return { width: 64, height: 64 }
        },
        create: params => {
            const { x, y, name } = params
            return { x, y, name }
        }
    },
    monster: {
        fields: ["span"],
        dims: () => {
            return { width: 0, height: 0 }
        },
        create: params => {
            const { x, y, name, span } = params
            return { x, y, name, span: +span }
        }
    },
    ball: {
        fields: ['seq'], // Inferred from Ball constructor and props.seq
        create: (params) => {
            // Perform transformation
            const { x, y, name, seq } = params
            return { x, y, name, seq }
        }
    },
    gearBlade: sawBlades({ small: "sb2", large: "sb6" }),
    gearBladeS: sawBlades({ small: "sb2", large: "sb6" }, true),
    spikeBlade: sawBlades({ small: "sb3", large: "sb5" }),
    spikeBladeS: sawBlades({ small: "sb3", large: "sb5" }, true),
    buttonBlade: sawBlades({ small: "sb1", large: "sb4" }),
    buttonBladeS: sawBlades({ small: "sb1", large: "sb4" }, true),
    lcr1: {
        fields: ['luck', 'dmg'], // Based on Crate constructor
        create: (params) => {
            const { luck, dmg, name, x, y, alignment } = params
            return { luck: +luck, dmg: +dmg, name, x: x, y: y + (alignment === "top-left" ? 32 : 0), groupId: "crates" }
        }
    },
    floorSpike: {
        fields: ["delay", "dx"],
        dims: () => {
            return { width: 80, height: 40 }
        },
        create: params => {
            const { delay = 0, x, dx = 0, y, name } = params
            return { delay: +delay, x: x + +dx * TILE_SIZE, y, name, groupId: "fspikes" }
        }
    },
    vlhd: lasers("vertical"),
    hlhd: lasers("horizontal"),
    crane: {
        create: params => {
            const { alignment, x, y, name } = params
            return { x, y: y + (alignment.includes("top") ? 32 : 0), name }
        }
    },
    bus: {
        fieldsFilter: () => true,  // No filtering needed since toX is gone
        fields: ['toY', 'period'], // Removed toX from fields
        dims: () => ({ width: 88, height: 88 }),
        create: (params) => {
            const { x, y, name, toY, period, alignment, projection } = params
            const results = []

            // Always create the track since we're only using vertical movement
            const trackX = projection.normal === "left" ?
                (projection.x + projection.w) * TILE_SIZE :
                projection.x * TILE_SIZE - 20

            for (let y = 0; y < projection.h; y++) {
                results.push({
                    x: trackX, y: (projection.y + y) * TILE_SIZE, name: "track", flipX: projection.normal === "right"
                })
            }

            // Add the bus with only vertical movement
            const delX = projection.normal === "right" ? -2 : 2
            results.push({
                groupId: "col-rects", x: x + delX, y: y + (alignment.startsWith("top") ? 32 : 0), name, toX: x, toY: y + (toY ? Number(toY) * TILE_SIZE : 0), period: +period, flip: projection.normal === "right"
            })

            return results
        }
    },
    default: {
        fields: [],
        create: params => {
            const groupId = groupMap[params.name]
            if (groupId) params.groupId = groupId
            const { x, y, name } = params
            return { x, y, name, groupId }
        }
    },
    wind: {
        dims: () => {
            return { width: 141, height: 144 }
        },
        create: params => {
            const { x, y } = params
            const result = [
                { x: x, y: y, name: "vent" },
                { x: x + 64, y: y - 4, name: "wind" }
            ]
            // for (let i = 0; i < 2; i++) {
            //     result.push({ x: x + 30, y: y - 340 - 40 * i, name: "orb" })
            //     result.push({ x: x + 70, y: y - 340 - 40 * i, name: "orb" })
            // }
            result.colRects = [
                { x, y, w: 141, h: 144, mat: "metal" }
            ]
            return result
        }
    },
    hearth: {
        fields: ["dir"],
        dims: () => {
            return { width: 204, height: 98 }
        },
        create: params => {
            const { x, y, dir } = params
            const result = [
                { x: x, y: y, name: "hearth", dir: Number(dir) },
            ]
            result.colRects = [
                { x, y, w: 204, h: 98 }
            ]
            return result
        }
    },
    bat: {
        fields: ["speed", "dx", "dy"],
        dims: () => {
            return { width: 96, height: 96 }
        },
        create: params => {
            const { x, y, speed, dx = 0, dy = 0 } = params
            return { x: x + dx * TILE_SIZE, y: y + dy * TILE_SIZE, name: "bat", speed: +speed }
        }
    },
    fire: {
        fields: ["decor"],
        dims: () => {
            return { width: 48, height: 32 }
        },
        create: (params) => {
            const { x, y, decor } = params
            const roundedX = x % 48 === 0 ? x : x + 24 * (Math.random() < 0.5 ? 1 : -1)
            const tilesX = (roundedX + 24) - endTiles.width * 48 / 2
            const tilesY = (y + 32) - endTiles.height * 48

            const results = [
                { x: roundedX - 16, y, name: "em1" },
                { x: roundedX + 24, y, name: "fire" },
            ]
            if (decor === "yes") {
                const wallTiles = endTiles.fg.tiles.map((row, i) => {
                    return row.map((cell, j) => {
                        return { name: cell, x: tilesX + j * 48, y: tilesY + i * 48 }
                    }).filter(cell => cell.name !== "empty")
                }).flat()
                results.push(...wallTiles)
                results.colRects = endTiles.colRects.map(({ x, y, width, height }) => {
                    return { x: tilesX + x * 48, y: tilesY + y * 48, w: width * 48, h: height * 48 }
                })
            }
            return results
        }
    },
    pillar: {
        fields: ["height", "dx"],
        dims({ height }) {
            return {
                width: 40, height: 122 * height
            }
        },
        create(params) {
            const { x, y, height, dx } = params
            return Array(+height).fill(0).map((_, i) => {
                return { x: x + +dx * TILE_SIZE, y: y + (i * 122), name: "pillar" }
            })
        }
    },
    leverSaw: {
        fields: ["path", "period", "length"],
        dims() {
            return { width: 79, height: 58 }
        },
        create(params) {
            const { x, y, length, period, path } = params
            const results = [{ x, y, length: +length, name: "leverSaw", period: +period, path }]
            results.colRects = [{
                x: x, y: y, h: 58, mat: "metal", w: 79
            }]
            return results
        }
    },
    topSaw: saws({ name: "saw1", field: "width" }),
    bottomSaw: saws({ name: "saw2", field: "width" }),
    spike: saws({ name: "spike", field: "width", dims: { width: 80, height: 40 }, xOffset: 8 }),
    flags: saws({ name: "em3", field: "width", dims: { width: 96, height: 16 }, groupId: false }),
    patch: saws({ name: ["patch1", "patch2"], field: "width", dims: { width: 48, height: 4 }, groupId: false }),
    patchup: saws({ name: "patch3", field: "width", dims: { width: 48, height: 4 }, groupId: false }),
    leftSaw: saws({ name: "saw4", field: "height" }),
    rightSaw: saws({ name: "saw3", field: "height" }),
    bridge: {
        fields: ["width"],
        dims({ width = 1 }) {
            return {
                width: (240 + 16) * width + 16, height: 104
            }
        },
        create(params) {
            const { x, y, width } = params
            const results = Array(+width).fill(width).map((_, i) => {
                const iX = x + i * 240
                return [
                    { name: "br1", x: iX + (i + 1) * 10, y: y + 10 },
                    { name: "br2", x: iX + i * 10, y: y }
                ]
            }).flat()
            results.push({
                x: x + (240 + 10) * width,
                y: y,
                name: "br2"
            })
            results.colRects = [{
                x: x, y: y + 10, h: 24, mat: "wood", w: 256 * width + 10
            }]
            return results
        }
    },
    magnet: {
        fields: ["width"],
        dims: ({ width = 1 }) => {
            return {
                width: 128 * width + 16 * 2, // magnet width + twice stud width
                height: 32
            }
        },
        create: (params) => {
            const { x, y, width } = params
            const magnets = Array.from({ length: width }, (_, i) => ({ name: "magnet", x: x + 16 + 128 * i, y, groupId: "magnets" }))
            return [
                ...magnets,
                { name: "stud", x, y },
                { name: "stud", x: x + 128 * width + 16, y }
            ]
        }
    },
    gate: {
        fields: ["speed", "toY"],
        create: params => {
            const { name, x, y, speed, toY } = params
            return { name, x, y, speed: +speed, endY: y + (toY * TILE_SIZE) }
        }
    },
    gateArch: {
        block: null,
        extendedLeft: false,
        fields: ["speed"],
        dims() {
            const block = new CompositeBlock(new Block(5, 4))
            this.block = block
            return { width: block.w * TILE_SIZE, height: (block.h + 3) * TILE_SIZE }
        },
        create: function (params) {
            const { x: originX, y: originY, speed } = params
            const { block } = this
            const dx = 0
            const dy = block.h - 4
            const gateY = originY + (TILE_SIZE * block.h) - 56
            const gate = { y: gateY, x: originX + (dx + 2.5) * TILE_SIZE - 56, name: "gate", endY: gateY - 128, speed: +speed }

            const blocks = block.children.flatMap(decomposeBlocks)
            const maxY = Math.max(...blocks.map(b => b.y)) + 1
            const maxX = Math.max(...blocks.map(b => b.x)) + 1
            const grid = Array(maxY).fill().map(() => Array(maxX).fill(null))

            blocks.forEach(b => {
                if (b.y >= 0 && b.y < maxY && b.x >= 0 && b.x < maxX) {
                    grid[b.y][b.x] = "wt_1"
                }
            })

            const archY = 2  // Relative to grid, not block offset
            const archX = 1  // Relative to grid, not block offset
            const resultBlocks = []

            for (let row = 0; row < maxY; row++) {
                for (let col = 0; col < maxX; col++) {
                    if (!grid[row][col]) continue

                    let tileName = "wt_1"
                    if (row === archY && col === archX) {
                        tileName = "garch"
                    } else if ((row === archY && (col === archX + 1 || col === archX + 2)) ||
                        (row === archY + 1 && col >= archX && col < archX + 3)) {
                        continue // Skip these positions (empty)
                    }

                    resultBlocks.push({
                        x: originX + (col + dx) * TILE_SIZE,
                        y: originY + (row + dy) * TILE_SIZE,
                        name: tileName
                    })
                }
            }

            const results = [gate, ...resultBlocks]
            results.colRects = block.collisionRects.map(({ x, y, w, h }) => {
                return { x: (x + dx) * TILE_SIZE + originX, y: (y + dy) * TILE_SIZE + originY, w: w * TILE_SIZE, h: h * TILE_SIZE }
            })
            return results
        }
    },
    vines: {
        randomize: true,
        fields: ["width"],
        dims({ width }) {
            return { width: width * TILE_SIZE, height: 0 }
        },
        configurations: [
            [1],
            [1, 3],
            [4, 4],
            [1, 4],
            [1, 4, 1],
            [4, 3],
            [3],
            [4],
            [4, 1]
        ],
        anchors: {
            1: {
                start: { x: 17, y: 0 },
                end: { x: 13, y: 53 }
            },
            3: {
                start: { x: 18, y: 0 },
                end: { x: 22, y: 152 }
            },
            4: {
                start: { x: 15, y: 1 },
                end: { x: 2, y: 102 }
            }
        },
        dimensions: {
            1: { width: 25, height: 54 },
            3: { width: 31, height: 152 },
            4: { width: 31, height: 104 },
            clump: { width: 68, height: 41 }
        },
        clumpAnchors: {
            top: [
                { x: 13, y: 12 },
                { x: 32, y: 12 },
                { x: 56, y: 12 },
            ],
            bottom: [
                { x: 15, y: 32 },
                { x: 37, y: 32 },
                { x: 51, y: 32 }
            ]
        },
        makeVine() {
            const { configurations, dimensions, anchors } = this

            // Randomly select a configuration
            const selectedConfig = configurations[Math.floor(Math.random() * configurations.length)];

            // Initialize the vines array
            const vines = [];

            // Initialize position
            let currentX = 0;
            let currentY = 0;

            // Keep track of min/max coordinates to calculate overall dimensions
            let minX = 0;
            let maxX = 0;
            let minY = 0;
            let maxY = 0;

            // Process each vine in the configuration
            for (let i = 0; i < selectedConfig.length; i++) {
                const vineType = selectedConfig[i];
                const vineAnchors = anchors[vineType];
                const vineDimensions = dimensions[vineType];

                // Calculate position so that the start anchor is at the current position
                const vineX = currentX - vineAnchors.start.x;
                const vineY = currentY - vineAnchors.start.y;

                // Add vine to array
                vines.push({
                    x: vineX,
                    y: vineY,
                    name: `vine${vineType}`
                });

                // Update boundary coordinates
                minX = Math.min(minX, vineX);
                maxX = Math.max(maxX, vineX + vineDimensions.width);
                minY = Math.min(minY, vineY);
                maxY = Math.max(maxY, vineY + vineDimensions.height);

                // Update current position to end anchor of current vine
                currentX = vineX + vineAnchors.end.x;
                currentY = vineY + vineAnchors.end.y;
            }
            return {
                vines,
                maxX,
                minX
            };
        },
        makeClump() {
            const { dimensions, anchors, clumpAnchors } = this;

            // Initialize the vines array
            const vines = [];

            // Pick a random vine type for the top vines (1, 3, or 4)
            const topVineType = pickOne([1, 3, 4]);

            // Decide how many top vines (1-3)
            const numTopVines = rand(3, 1); // Corrected order: rand(to, from)

            // Randomly select which top anchors to use
            const topAnchorIndices = [];
            while (topAnchorIndices.length < numTopVines) {
                const idx = rand(2); // Simplified since from is 0
                if (!topAnchorIndices.includes(idx)) {
                    topAnchorIndices.push(idx);
                }
            }

            // Position the clump at origin initially
            const clumpX = 0;
            const clumpY = 0;

            // Add clump to vines array
            vines.push({
                x: clumpX,
                y: clumpY,
                name: "vine2"
            });

            // Track min/max coordinates
            let minX = clumpX;
            let maxX = clumpX + dimensions.clump.width;

            // Add top vines - important fix: align the start anchor of the vine with the clump's top anchor
            for (const anchorIdx of topAnchorIndices) {
                const topAnchor = clumpAnchors.top[anchorIdx];
                const vineStartAnchor = anchors[topVineType].start;

                // Calculate position so the end anchor of the vine aligns with the clump's top anchor
                const vineX = clumpX + topAnchor.x - vineStartAnchor.x;
                const vineY = clumpY + topAnchor.y - dimensions[topVineType].height;

                vines.push({
                    x: vineX,
                    y: vineY,
                    name: `vine${topVineType}`
                });

                // Update min/max
                minX = Math.min(minX, vineX);
                maxX = Math.max(maxX, vineX + dimensions[topVineType].width);
            }

            // Decide how many bottom vines (0-3)
            const numBottomVines = rand(3); // Simplified since from is 0

            // Randomly select which bottom anchors to use
            const bottomAnchorIndices = [];
            while (bottomAnchorIndices.length < numBottomVines) {
                const idx = rand(2); // Simplified since from is 0
                if (!bottomAnchorIndices.includes(idx)) {
                    bottomAnchorIndices.push(idx);
                }
            }

            // Add bottom vines
            for (const anchorIdx of bottomAnchorIndices) {
                // Randomly select a vine type for each bottom vine
                const bottomVineType = pickOne([1, 3, 4]);
                const bottomAnchor = clumpAnchors.bottom[anchorIdx];
                const vineStartAnchor = anchors[bottomVineType].start;

                // Calculate position so the start anchor of the vine aligns with the clump's bottom anchor
                const vineX = clumpX + bottomAnchor.x - vineStartAnchor.x;
                const vineY = clumpY + bottomAnchor.y;

                vines.push({
                    x: vineX,
                    y: vineY,
                    name: `vine${bottomVineType}`
                });

                // Update min/max
                minX = Math.min(minX, vineX);
                maxX = Math.max(maxX, vineX + dimensions[bottomVineType].width);
            }

            // Now we need to shift everything so the left-most top anchor is at x=0
            // and the top anchored vines are at y=0

            // Find the leftmost top anchor that is being used
            const leftmostAnchorX = Math.min(...topAnchorIndices.map(idx => clumpAnchors.top[idx].x));
            const xOffset = clumpX + leftmostAnchorX;

            // Find the topmost y-coordinate among the top vines
            let topVineMinY = 0;
            for (const vine of vines) {
                if (vine.name === `vine${topVineType}`) {
                    topVineMinY = Math.min(topVineMinY, vine.y);
                }
            }

            // Shift all vines
            for (const vine of vines) {
                vine.x -= xOffset;
                vine.y -= topVineMinY;
            }

            // Adjust min/max
            minX -= xOffset;
            maxX -= xOffset;

            return {
                vines,
                minX,
                maxX
            };
        },
        makeVines(maxWidth, x, y) {
            const vines = [];
            let currentX = 0;

            while (currentX < maxWidth) {
                // Decide whether to add a vine or clump
                const results = rand(1) === 1 ? this.makeClump() : this.makeVine();

                // Check if adding this element would exceed maxWidth
                if (currentX + (results.maxX - results.minX) > maxWidth) {
                    break; // Stop adding elements if we would exceed maxWidth
                }

                // Adjust position for all vines in the result
                results.vines.forEach(vine => {
                    vines.push({
                        x: vine.x + x + currentX - results.minX,
                        y: vine.y + y,
                        name: vine.name,
                        layer: "fg"
                    });
                });

                // Move currentX to the end of the element we just added
                currentX += (results.maxX - results.minX);
            }

            return vines;
        },
        create(params) {
            const { x, y } = params
            const width = params.width * TILE_SIZE
            const vines = this.makeVines(width, x, y)
            return vines
        }
    },
    windmill: {
        dims() {
            return { width: 64, height: 114 }
        },
        create(params) {
            const { x, y } = params
            return { name: "windmill", x, y }
        }
    },
    crate: stackables({ name: "crate", dims: { width: 88, height: 88 } }),
    tyre: stackables({ name: "tyre", dims: { width: 104, height: 32 } }),
    sc: stackables({ name: "sc", dims: { width: 120, height: 120 } }),
    bar: stackables({ name: "bar", dims: { width: 48, height: 48 } }),
    mesh: stackables({ name: "mesh", dims: { width: 48, height: 48 } }),
    block: {
        fields: ["type", "width", "height"],
        validTypes: ["hollow", "lattice"],
        dims({ width, height }) {
            return { width: width * TILE_SIZE, height: height * TILE_SIZE }
        },
        create(params) {
            const { x, y, width, height } = params
            const type = this.validTypes.includes(params.type) ? params.type : "hollow"
            const results = []
            console.log("Creating block with type", type)
            // Place tiles based on the type
            if (type === "hollow") {
                // For hollow blocks, only place tiles on the boundary
                for (let i = 0; i < height; i++) {
                    for (let j = 0; j < width; j++) {
                        // Special case for width=2 hollow - fill everything since hollow isn't possible
                        if (width === 2 || i === 0 || j === 0 || i === height - 1 || j === width - 1) {
                            results.push({ x: x + j * TILE_SIZE, y: y + i * TILE_SIZE, name: "wt_1" })
                        }
                    }
                }
            } else if (type === "lattice") {
                // Special case for width=2: treat left column as non-boundary with lattice pattern
                if (+width === 2) {
                    for (let i = 0; i < height; i++) {
                        for (let j = 0; j < width; j++) {
                            // Top, bottom, and right edges are boundaries
                            if (i === 0 || j === width - 1) {
                                results.push({ x: x + j * TILE_SIZE, y: y + i * TILE_SIZE, name: "wt_1" });
                            }
                            // Left column (j=0) gets lattice pattern: place tiles on alternate rows
                            else if (j === 0 && i % 2 === 0) { // Changed from i % 2 === 0 to i % 2 === 1
                                results.push({ x: x + j * TILE_SIZE, y: y + i * TILE_SIZE, name: "wt_1" });
                            }
                        }
                    }
                }
                // Special case for height=2: treat top row as non-boundary with lattice pattern
                else if (+height === 2) {
                    for (let i = 0; i < height; i++) {
                        for (let j = 0; j < width; j++) {
                            // Left, right, and bottom edges are boundaries
                            if (j === 0 || i == 0) {
                                results.push({ x: x + j * TILE_SIZE, y: y + i * TILE_SIZE, name: "wt_1" });
                            }
                            // Top row (i=0) gets lattice pattern: place tiles on alternate columns
                            else if (i === 1 && j % 2 === 0) { // Changed from j % 2 === 0 to j % 2 === 1
                                results.push({ x: x + j * TILE_SIZE, y: y + i * TILE_SIZE, name: "wt_1" });
                            }
                        }
                    }
                }
                // Standard case for larger dimensions
                else {
                    for (let i = 0; i < height; i++) {
                        for (let j = 0; j < width; j++) {
                            // Place boundary tiles
                            if (i === 0 || j === 0 || i === height - 1 || j === width - 1) {
                                results.push({ x: x + j * TILE_SIZE, y: y + i * TILE_SIZE, name: "wt_1" });
                            }
                            // For inner tiles, create a lattice/mesh pattern
                            else if (i % 2 === 0 || j % 2 === 0) {
                                results.push({ x: x + j * TILE_SIZE, y: y + i * TILE_SIZE, name: "wt_1" });
                            }
                        }
                    }
                }
            }

            // Set the collision rectangle
            results.colRects = [{
                x,
                y,
                w: width * TILE_SIZE,
                h: height * TILE_SIZE,
                mat: type === "hollow" ? "wood" : "metal"
            }]

            return results
        }
    }
}

module.exports = factories