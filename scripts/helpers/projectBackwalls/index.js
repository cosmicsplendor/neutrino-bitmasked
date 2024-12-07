const { scoreArea, scoreSupportingWidth, scoreWidth } = require("./scoreFns");
const projectCompositeRects = require("../../utils/projectCompositeRects");
const { skewedRand, rand } = require("../../utils");
const { promptFields, getChoice, message } = require("../term");

const MAX_TILES = 24

const getMapTiles = (map, x, y) => {
    if (x < 0 || x >= map.w) return 0
    if (y < 0 || y >= map.h) return 0
    return map.getTile(x, y) ? 1 : 0
}

const getSupportingWidth = (map, p) => {
    if (p.normal === "left") {
        return Array(p.h).fill(p.y).map((py, i) => getMapTiles(map, p.x - 1, py + i))
    }
    if (p.normal === "right") {
        return Array(p.h).fill(p.y).map((py, i) => getMapTiles(map, p.x + p.w, py + i))
    }
    if (p.normal === "top") {
        return Array(p.w).fill(p.x).map((px, i) => getMapTiles(map, px + i, p.y - 1))
    }
    if (p.normal === "bottom") {
        return Array(p.w).fill(p.x).map((px, i) => {
            const sw = getMapTiles(map, px + i, p.y + p.h)
            return sw
        })
    }
    return []
}

const computeScore = (map, p) => {
    const area = p.w * p.h
    const width = p.normal == "left" || p.normal === "right" ? p.h : p.w
    const height = p.normal == "left" || p.normal === "right" ? p.w : p.h
    const supportingWidth = getSupportingWidth(map, p).filter(b => b !== 0).length
    const areaScore = scoreArea(area)
    const widthScore = scoreWidth(width)
    const supportingWidthScore = scoreSupportingWidth(width, supportingWidth, height)
    // return Math.sqrt(area * area + width * width + supportingWidth * supportingWidth)
    return (areaScore + widthScore + supportingWidthScore) / 3
}

const findBestProjections = (map, projections) => {
    const best = projections
        .map(p => {
            const score = computeScore(map, p)
            return { score, p }
        })
        .filter(p => p.score > 0.2)
        .sort((p1, p2) => p2.score - p1.score)
        .map(p => {
            return p.p
        })
        .slice(0, 3)
    return best
}


const wait = sec => new Promise((r => setTimeout(r, sec * 1000)))
const bws = ["bw4", "bw5", "bw6", "bw7"]
const postprocessGrid = (map, grid, { x: x0, y: y0, normal }) => {
    // extend the grid by 1 along y axis
    const cols = grid[0].length;
    grid.push(Array(cols).fill(null))
    const rows = grid.length;
    function checkCell(row, col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            return 0; // Out of bounds
        }
        if (!grid[row][col]) {
            return 0
        }
        return grid[row][col].tile !== "bw10" ? 1 : 0
    }

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cur = checkCell(row, col);
            const top = checkCell(row - 1, col);

            const occluded = map.getTile(x0 + col, y0 + row)
            if (occluded) {
                grid[row][col] = null
                if (top && normal === "bottom") { // bottom backwall
                    const topTile = grid[row - 1][col].tile ?? "bw1"
                    grid[row - 1][col].tile = topTile === "bw1" ? "bw3" : "bw1"
                }
            } else if (top && !cur) { // bottom stub
                grid[row][col] = { y: y0 + row, x: x0 + col, tile: "bw10" };
            } else if (row === 0 && normal === "bottom" && !cur) {
                grid[row][col] = { y: y0 + row, x: x0 + col, tile: Math.random() < 0.125 ? bws[rand(bws.length - 1)] : "bw10" };
            }

            if (checkCell(row, col)) {
                grid[row][col].tile = Math.random() < 0.125 ? bws[rand(bws.length - 1)] : "bw1"
            }
        }
    }

    return grid;
}

const percent = (p, l) => Math.round(p * l / 100)

const generateLeftTiles = (map, p) => {
    if (p.normal !== "left") return []
    const supportingWidth = getSupportingWidth(map, p)
    const placeInReverse = Math.random() < 0.5
    const grid = Array.from({ length: p.h }, () => Array(p.w).fill(null))
    
    let fullWidths = 0
    let lastX0 = 0
    let lastW = p.w
    
    Array.from({ length: p.h }, (_, row) => {
        const y = placeInReverse ? p.h - 1 - row : row
        const fullWidth = fullWidths < percent(50, p.h) && supportingWidth[row]
        if (fullWidth) fullWidths++

        // Generate width, ensuring it doesn't exceed the grid's width
        const w = fullWidth ? p.w : (Math.random() < 0.5 ? rand(p.w, 1) : skewedRand(p.w, 1))

        // Ensure that the current (x0, x0 + w) intersects with (lastX0, lastX0 + lastW) by at least 2 units
        const minIntersection = Math.min(lastX0 + lastW, p.w) - lastX0 // Minimum intersection of 2 units
        const maxX0 = Math.min(lastX0 + lastW - 2, p.w - w) // Constrain x0 to ensure 2 units intersection

        // Make sure x0 does not overflow the grid's column range
        const x0 = Math.max(0, Math.min(p.w - w, skewedRand(maxX0, Math.max(0, lastX0 - w + 2))))

        // Update lastX0 and lastW for the next iteration
        lastW = w
        lastX0 = x0

        // Fill in the grid for the current row
        for (let i = 0; i < w; i++) {
            const x = x0 + (w - 1 - i)
            if (x >= 0 && x < p.w) {  // Ensure x stays within the grid's column range
                grid[y][x] = { x: p.x + x, y: y + p.y }
            }
        }
    })
    
    return postprocessGrid(map, grid, p).flat().filter(x => !!x)
}


const generateBottomTiles = (map, p) => {
    if (p.normal !== "bottom") return []
    const supportingWidth = getSupportingWidth(map, p)
    const placeInReverse = Math.random() < 0.5
    const grid = Array.from({ length: p.h }, () => Array(p.w).fill(null))
    let fullHeights = 0
    let lastY0 = 0
    let lastH = p.h
    Array.from({ length: p.w }, (_, col) => {
        const x = placeInReverse ? p.w - 1 - col : col
        const fullHeight = fullHeights < percent(50, p.w) && supportingWidth[col]
        if (fullHeight) fullHeights++
        
        // Generate height as before, ensuring it doesn't exceed the grid's height
        const h = fullHeight ? p.h : (Math.random() < 0.5 ? rand(p.h, 1) : skewedRand(p.h, 1))

        // Ensure that the current (y0, y0 + h) intersects with (lastY0, lastY0 + lastH) by at least 2 units
        const minIntersection = Math.min(lastY0 + lastH, p.h) - lastY0 // Minimum intersection of 2 units
        const maxY0 = Math.min(lastY0 + lastH - 2, p.h - h) // Constrain y0 to ensure 2 units intersection

        // Make sure y0 does not overflow the grid's row range
        const y0 = Math.max(0, Math.min(p.h - h, skewedRand(maxY0, Math.max(0, lastY0 - h + 2))))

        // Update lastY0 and lastH for the next iteration
        lastH = h
        lastY0 = y0

        // Fill in the grid for the current column
        for (let i = 0; i < h; i++) {
            const y = y0 + (h - 1 - i)
            if (y >= 0 && y < p.h) {  // Ensure y stays within the grid's row range
                grid[y][x] = { x: x + p.x, y: p.y + y }
            }
        }
    })
    return postprocessGrid(map, grid, p).flat().filter(x => !!x)
}




const generateTiles = (map, p) => {
    const tiles = p.normal === "bottom" ? generateBottomTiles(map, p) : generateLeftTiles(map, p)
    return tiles
}

const undoTiles = async (map, tiles) => {
    tiles.forEach(({ x, y }) => {
        map.setTile(x, y, null, "mg")
    })
    await map.exportMap()
}
const exportmap = async (map, tiles) => {
    tiles.forEach(({ x, y, tile }) => {
        map.setTile(x, y, tile ?? "bw1", "mg")
    })
    await map.exportMap()
}

const getProjectedTiles = async (map, bestProjections) => {
    const acceptedTiles = []
    console.log("HERE")
    for (const i in bestProjections) {
        const p = bestProjections[i]
        const MAX_RETRIES = 100; // Add a safety limit
        let retryCount = 0;
        
        while(true) {
            console.log("HERE")
            if (retryCount >= MAX_RETRIES) {
                console.warn(`Maximum retries (${MAX_RETRIES}) reached for projection ${i}`);
                console.log(p)
                break;
            }
        
            const tiles = generateTiles(map, p)
            const previewTiles = [...acceptedTiles, ...tiles]
            await exportmap(map, previewTiles)
            
            if (tiles.length === 0) break;
            
            message(`[${Number(i) + 1} of ${bestProjections.length}] projecting back walls`)
            const choice = await getChoice([ "Retry", "Discard", "Accept", "Discard Rest" ])
            
            if (choice === "Accept") {
                acceptedTiles.push(...tiles)
                break;
            } else if (choice === "Retry") {
                retryCount++;
                await undoTiles(map, tiles)
                continue;
            } else if (choice === "Discard") {
                await undoTiles(map, tiles)
                break;
            } else {
                return acceptedTiles
            }
        }
    }
    return acceptedTiles
}

const projectBackwalls = async (map, block) => {
    const projections = projectCompositeRects(block, map.collisionRects, map)
    const bestProjections = projections.length > 3 ? findBestProjections(map, projections) : []
    const acceptedTiles = await getProjectedTiles(map, bestProjections)

    acceptedTiles.forEach(({ x, y, tile }) => {
        map.setTile(x, y, tile ?? "bw1", "mg")
    })
    return acceptedTiles
}

module.exports = projectBackwalls