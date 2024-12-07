const getTileNumber = require("./generateTiles/helpers/createGrid/getTileNumber")

const isBlockFixed = (map, block) => {
    // Function to check if a tile is empty
    const isTileEmpty = (x, y) => {
        const tile = map.getTile(x, y);
        return tile === null;
    };

    // Check the surrounding layer (one tile around the block)
    for (let row = -1; row <= block.h; row++) {
        for (let col = -1; col <= block.w; col++) {
            const x = block.x + col;
            const y = block.y + row;

            // Skip checking inside the block area itself
            const isBoundaryTile = (row === -1 || row === block.h || col === -1 || col === block.w);
            
            if (isBoundaryTile && !isTileEmpty(x, y)) {
                // If any surrounding tile is not empty, the block isn't fixed
                return false;
            }
        }
    }
    
    // If all surrounding tiles are empty, the block is fixed
    return true;
};

const fixBoundaries = async (map, block) => {
    const topEmptiers = ["win2"]
    const leftEmptiers = ["wt_14", "wt_17", "wt_15", "wt_16"]
    const getAdjacentTile = (row, col, dir = { x: 0, y: 0 }) => {
        return map.getTile(col + dir.x, row + dir.y)
    }
    const fixed = isBlockFixed(map, block)
    if (fixed) {
        await map.exportMap("testlevel")
    }

    const boundingBlock = Array.from({ length: block.h + 4 }, (_, row) => {
        return Array.from({ length: block.w + 4 }, (_, col) => {
            const x = block.x - 2 + col
            const y = block.y - 2 + row
            if (x < 0 || x > map.w - 1 || y < 0 || y > map.h - 1) return 1
            const leftTile = getAdjacentTile(y, x, { x: -1, y: 0 })
            const topTile = getAdjacentTile(y, x, { x: 0, y: -1 })
            const tile = map.getTile(x, y)
            if (!tile) {
                if (leftEmptiers.includes(leftTile)) return 1
                if (topEmptiers.includes(topTile)) return 1
                return 0
            }
            if (tile.startsWith("wt_")) {
                const num = Number(tile.slice(3))
                if (num === 14) return 2
                if (num === 15) return 3
                if (num === 16) return 4
                if (num === 17) return 5
                return num
            }
            return 1
        })
    })
    const normalizedGrid = boundingBlock.map(row => {
        return row.map(cell => !!cell ? 1 : 0)
    })

    const boundaryInfo = boundingBlock.map((row, j) => {
        return row.map((cell, i) => {
            const tileNumber = getTileNumber(normalizedGrid, j, i)
            return { tileNumber, cell }
        }).slice(1, row.length - 1)
    }).slice(1, boundingBlock.length - 1)

    const validIs = [0, 1, block.w, block.w + 1]
    const validJs = [0, 1, block.h, block.h + 1]
    /**
     * got to deal with these following cases:
     * 1. right edge demolished - scan the grid and make sure tiles right to it is non existent
     * 2. all the engravings cells should be considered equivalent to wt_9
     * 3. left edge demolished - equvalent to left edge
     */
    const wt9Equiv = ["en11", "en12", "en13", "en14", "en15", "en16"]
    boundaryInfo.forEach((row, j) => {
        row.forEach(({ tileNumber, cell }, i) => {
            if (validIs.includes(i) || validJs.includes(j)) {
                if (cell === 0) return
                const tile = map.getTile(block.x+i-1, block.y+j-1)
                const leftTile = map.getTile(block.x+i-2, block.y+j-1)
                if (wt9Equiv.includes(tile) && tileNumber === 9) return
                if (tileNumber === 3 && leftTile === "wt_15") {
                    return
                }
                if (tileNumber !== 3 && leftTile === "wt_15" || tileNumber !== 4 && leftTile === "wt_16") {
                    map.collapseTile({ x: block.x+i-2, y: block.y+j-1, tile: "wt_1"})
                    return
                }
                if (tileNumber === 4 && leftTile === "wt_16") {
                    return
                }
                if (tile === "wt_14") {
                    if (tileNumber === 2) return
                    if (tileNumber === 5) {
                        map.collapseTile({ x: block.x - 1 + i, y: block.y - 1 + j, tile: "wt_17", worldSpace: false })
                        return
                    }
                }
                if (tile === "wt_17") {
                    if (tileNumber === 5) return
                    map.collapseTile({x: block.x + i, y: block.y - 1 + j, tile: "wt_1", worldSpace: false })
                }
                map.collapseTile({ x: block.x - 1 + i, y: block.y - 1 + j, tile: `wt_${tileNumber}`, worldSpace: false})
            }
        })
    })
    await map.exportMap("testlevel")
}
module.exports = fixBoundaries