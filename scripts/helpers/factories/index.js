const { pickOne, rand, CompositeBlock, Block, decomposeBlocks } = require("../../utils")
const lasers = require("./lasers")
const groupMap = require("../../utils/groupMap.json")
const { generateTileSpawnPoints } = require("../generateTiles")
const saws = require("./saws")
const endTiles = require("./endTiles.json")
const sawBlades = require("./sawBlades")
const stackables = require("./stackables")
const TILE_SIZE = 48
const STACK_TOP = ["top-start", "top-end", "top"]
const factories = {
    player: {
        fields: [], // No specific props inferred from the original code
        create: (params) => {
            const { x, y, name } = params
            return { x, y, name }
        }
    },
    checkpoint: {
        create: (params) => {
            const { x, y, name } = params
            return { x, y, name }
        }
    },
    orb: {
        dims: () => {
            return { width: 64, height: 64 }
        },
        create: params => {
            const { x, y, name } =params
            return { x, y, name }
        }
    },
    monster: {
        fields: [ "span" ],
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
        fields: [ "delay" ],
        dims: () => {
            return { width: 80, height: 40 }
        },
        create: params => {
            const { delay=0, x, y, name } = params
            return { delay: +delay, x, y, name }
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
                results.push({  x: trackX,  y: (projection.y + y) * TILE_SIZE,  name: "track",  flipX: projection.normal === "right" 
                })
            }
            
            // Add the bus with only vertical movement
            const delX = projection.normal === "right" ? -2 : 2
            results.push({  groupId: "col-rects",  x: x + delX,  y: y + (alignment.startsWith("top") ? 32 : 0),  name,  toX: x, toY: y + (toY ? Number(toY) * TILE_SIZE : 0),  period: +period,  flip: projection.normal === "right" 
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
                { x: x, y: y, name: "vent"},
                { x: x + 64, y: y - 4, name: "wind" }
            ]
            result.colRects = [
                { x, y, w: 141, h: 144, mat: "metal" }
            ]
            return result
        }
    },
    hearth: {
        fields: ["dir"],
        dims: () => {
            return { width: 128, height: 118 }
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
    fire: {
        fields: [],
        dims: () => {
            return { width: 48, height: 32 }
        },
        possible(projection, alignment) {
            if (alignment !== "bottom") return false // only possible alignments
            if (projection.w < 3) return false // only possible for odd tile count greater than 1
            return true
        },
        create: (params) => {
            const { x, y } = params
            const roundedX = x % 48 === 0 ? x: x + 24 * (Math.random() < 0.5 ? 1: -1)
            const tilesX = (roundedX + 24) - endTiles.width * 48 / 2
            const tilesY = (y + 32) - endTiles.height * 48
            const wallTiles = endTiles.fg.tiles.map((row, i) => {
                return row.map((cell, j) => {
                    return { name: cell, x: tilesX + j * 48, y: tilesY + i * 48 }
                }).filter(cell => cell.name !== "empty")
            }).flat()
         
            const results = [
                { x: roundedX - 16, y, name: "em1", collapsed: [{ y: y + 32, x: roundedX, tile: "wt_1" }] },
                { x: roundedX + 24, y, name: "fire" },
                ...wallTiles
            ]
            results.colRects = endTiles.colRects.map(({ x, y, width, height }) => {
                return { x: tilesX + x * 48, y: tilesY + y * 48, w: width * 48, h: height * 48 }
            })
            return results
        }
    },
    pillar: {
        fields: ["height"],
        dims({ height }) {
            return {
                width: 40, height: 122 * height
            }
        },
        create(params) {
            const { x, y, height } = params
            return Array(+height).fill(0).map((_, i) => {
                return { x: x, y: y + (i * 122), name: "pillar" }
            })
        }
    },
    leverSaw: {
        fields: ["path", "period"],
        dims() {
            return { width: 79, height: 58 }
        },
        create(params) {
            const { x, y, length, period, path } = params
            const results = [{ x, y, length: 200, name: "leverSaw", period: +period, path }]
            results.colRects = [ {
                x: x, y: y, h: 58, mat: "metal", w: 79
            }] 
            return results
        }
    },
    topSaw: saws({ name: "saw1", field: "width" }),
    bottomSaw: saws({ name: "saw2", field: "width" }),
    spike: saws({ name: "spike", field: "width", dims: { width: 80, height: 40 }, xOffset: 8 }),
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
        fields: [ "width" ],
        dims: ({ width=1 }) => {
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
            return { name, x, y, speed: +speed, endY: y + (toY * TILE_SIZE)}
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
        create: function(params) {
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

            const results = [ gate, ...resultBlocks ]
            results.colRects = block.collisionRects.map(({ x, y, w, h }) => {
                return { x: (x + dx) * TILE_SIZE + originX, y: (y + dy) * TILE_SIZE + originY, w: w * TILE_SIZE, h: h * TILE_SIZE}
            })
            return results
        }
    },
    crate: stackables({ name: "crate", dims: { width: 88, height: 88 }}),
    tyre: stackables({ name: "tyre", dims: { width: 104, height: 32 } }),
    sc: stackables({ name: "sc", dims: { width: 120, height: 120 }})
}

module.exports = factories