const fs = require("fs/promises")
const collisionMatMap = require("./collisionMatMap.json");
const layerMap = require("./layerMap.json")

const rand = (to, from = 0) => from + Math.floor((to - from + 1) * Math.random());
const skewedRand = (to, from = 0) => from + Math.floor((to - from + 1) * Math.random() * Math.random());
const pickOne = arr => arr[rand(arr.length - 1)];
const clamp = (min, max, value) => Math.max(min, Math.min(max, value));

function weightedRand(from, to, density) {
    if (density === 0) return from;

    const weight = density / 100;
    const random = Array(rand(10, 2)).fill(0).map(() => Math.random()).reduce((acc, x) => x + acc, 0) / 5; // Adds more variability
    const mean = from + (to - from) * weight;
    const value = Math.round(mean * random * 2);

    return clamp(Math.min(from, to), Math.max(from, to), value);
}

function mergeRects(rects) {
    if (rects.length === 0) return []

    rects.sort((a, b) => a.y - b.y || a.x - b.x)

    const mergedHorizontally = []
    let current = rects[0]

    for (let i = 1; i < rects.length; i++) {
        const next = rects[i]

        if (current.y === next.y && current.h === next.h &&
            current.x + current.w === next.x) {
            current.w = current.w + next.w
        } else {
            mergedHorizontally.push({ ...current })
            current = next
        }
    }

    mergedHorizontally.push({ ...current })

    const mergedVertically = []
    mergedHorizontally.sort((a, b) => a.x - b.x || a.y - b.y)

    current = mergedHorizontally[0]

    for (let i = 1; i < mergedHorizontally.length; i++) {
        const next = mergedHorizontally[i]

        if (current.x === next.x && current.w === next.w &&
            current.y + current.h >= next.y) {
            current.h = Math.max(current.y + current.h, next.y + next.h) - current.y
        } else {
            mergedVertically.push({ ...current })
            current = next
        }
    }

    mergedVertically.push({ ...current })

    return mergedVertically
}
function groupAndMergeRectsByMat(rects) {
    if (rects.length === 0) return []

    // Step 1: Group rectangles by their `mat` property
    const groupedByMat = rects.reduce((groups, rect) => {
        const mat = rect.mat ?? "concrete"
        if (!groups[mat]) {
            groups[mat] = []
        }
        groups[mat].push(rect)
        return groups
    }, {})

    // Step 2: Merge each group of rectangles and collect the results
    const mergedRects = []

    for (const mat in groupedByMat) {
        const group = groupedByMat[mat]

        // Call the mergeRects function on each group and add the mat property back to the merged rectangles
        const mergedGroup = mergeRects(group).map(rect => ({
            ...rect, // Keep merged rectangle properties (x, y, w, h)
            mat // Add the original mat property
        }))

        // Add the merged group to the final result array
        mergedRects.push(...mergedGroup)
    }

    // Step 3: Return the array of merged rectangles
    return mergedRects
}
const sc = { // stack calcs
    il: c => { // inside-left
        return c.x
    },
    ol: (c, e) => { // outside-left
        return c.x - e.w
    },
    ir: (c, e) => { // inside-right
        return c.x + (c.w - e.w)
    },
    or: c => { // outiside-right
        return c.x + c.w
    },
    hc: (c, e) => { // horizontal center
        return c.x + (c.w - e.w) / 2
    },
    it: c => { // inside-top
        // c --> container bounds; e --> entity bounds
        return c.y
    },
    ot: (c, e) => { // outside-top
        return c.y - e.h
    },
    ib: (c, e) => { // inside-bottom
        return c.y + (c.h - e.h)
    },
    ob: c => { // outiside-bottom
        return c.y + c.h
    },
    vc: (c, e) => { // vertical center
        return c.y + (c.h - e.h) / 2
    }
}

function calcAligned(c, e, x, y, mX = 0, mY = 0) {
    const pos = { x: mX, y: mY }
    switch (x) {
        case "left":
            pos.x += sc.il(c, e)
            break
        case "center":
            pos.x += sc.hc(c, e)
            break
        case "right":
            pos.x += sc.ir(c, e)
            break
        default:
            throw new Error(`Invalid x-alignment parameter: ${x}`)
    }
    switch (y) {
        case "top":
            pos.y += sc.it(c, e)
            break
        case "center":
            pos.y += sc.vc(c, e)
            break
        case "bottom":
            pos.y += sc.ib(c, e)
            break
        default:
            throw new Error(`Invalid y-alignment parameter: ${y}`)
    }
    return Object.assign(e, pos)
}

function calcStacked(b1, b2, dir, mX = 0, mY = 0) {
    const pos = { x: mX, y: mY }
    switch (dir) {
        case "top-start":
            pos.x += sc.il(b1, b2)
            pos.y += sc.ot(b1, b2)
            break
        case "top":
            pos.x += sc.hc(b1, b2)
            pos.y += sc.ot(b1, b2)
            break
        case "top-end":
            pos.x += sc.ir(b1, b2)
            pos.y += sc.ot(b1, b2)
            break
        case "right-start":
            pos.x += sc.or(b1, b2)
            pos.y += sc.it(b1, b2)
            break
        case "right":
            pos.x += sc.or(b1, b2)
            pos.y += sc.vc(b1, b2)
            break
        case "right-end":
            pos.x += sc.or(b1, b2)
            pos.y += sc.ib(b1, b2)
            break
        case "bottom-start":
            pos.x += sc.il(b1, b2)
            pos.y += sc.ob(b1, b2)
            break
        case "bottom":
            pos.x += sc.hc(b1, b2)
            pos.y += sc.ob(b1, b2)
            break
        case "bottom-end":
            pos.x += sc.ir(b1, b2)
            pos.y += sc.ob(b1, b2)
            break
        case "left-start":
            pos.x += sc.ol(b1, b2)
            pos.y += sc.it(b1, b2)
            break
        case "left":
            pos.x += sc.ol(b1, b2)
            pos.y += sc.vc(b1, b2)
            break
        case "left-end":
            pos.x += sc.ol(b1, b2)
            pos.y += sc.ib(b1, b2)
            break
        default:
            throw new Error(`Invalid stacking direction: ${dir}`)
    }
    pos.x = Math.round(pos.x)
    pos.y = Math.round(pos.y)
    return pos
}

const combine = (a, b, dir) => {
    switch (dir) {
        case "x":
            return {
                w: a.w + b.w,
                h: Math.max(a.h, b.h)
            }
        case "y":
            return {
                w: Math.max(a.w, b.w),
                h: Math.max(a.h, b.h)
            }
        default:
            throw new Error(`Invalid combine direction: ${dir}`)
    }
}


const calcComposite = entities => { // compute a rect that contains all the entities
    const composite = { ...entities[0] }
    for (let i = 1; i < entities.length; i++) {
        const ent = entities[i]
        const rEdgX = Math.max(composite.x + composite.w, ent.x + ent.w)
        const bEdgY = Math.max(composite.y + composite.h, ent.y + ent.h)

        composite.x = Math.min(composite.x, ent.x)
        composite.y = Math.min(composite.y, ent.y)
        composite.w = rEdgX - composite.x
        composite.h = bEdgY - composite.y
    }
    return composite
}


class Block {
    x = 0
    y = 0
    static new(w, h) {
        return new this(w, h)
    }
    constructor(w, h) {
        this.w = w
        this.h = h
    }
}

class CompositeBlock extends Block {
    collisionRects = []
    children = []
    static _map = null
    static registerMap(map) {
        this._map = map
    }
    static create(blockOrConfig) {
        const initialBlock = blockOrConfig instanceof Block || blockOrConfig instanceof CompositeBlock ? blockOrConfig : new Block(blockOrConfig.width, blockOrConfig.height)
        return new CompositeBlock(initialBlock)
    }
    constructor(initialBlock) {
        super(0, 0)
        this.addPart({ block: initialBlock })
    }
    addPart({ block: _block, width, height, position, onto = "parent", dx, dy }) {
        const block = typeof width === "number" && typeof height === "number" ? new Block(width, height) : _block
        const stackAgainst = onto === "parent" ? this : (onto === "last" ? this.last : undefined)
        if (stackAgainst === undefined) throw new Error(`Invalid onto param: ${onto}`)
        if (this.children.length === 0) { // initial child
            this.children.push(block);
            Object.assign(this, block);
        } else {
            Object.assign(block, calcStacked(stackAgainst, block, position, dx, dy));
            this.children.push(block);
            Object.assign(this, calcComposite(this.children));
        }

        this.last = block;
        this.collisionRects.push({ ...block });
        this.collisionRects = mergeRects(this.collisionRects);

        return this;
    }

    stackOn(block, { position, dx, dy }) { // stack itself onto sth
        const { x, y } = calcStacked(block, this, position, dx, dy)
        const xShift = x - this.x
        const yShift = y - this.y

        this.x = x
        this.y = y

        return this.shift(xShift, yShift)
    }
    shift(dx, dy = 0) {
        this.children.forEach(block => {
            block.x += dx
            block.y += dy
        })

        this.collisionRects.forEach(rect => {
            rect.x += dx
            rect.y += dy
        })
        return this
    }
    addToMap({ collision, layer } = { collision: false, layer: "fg" }) {
        CompositeBlock._map.addBlock({ block: this, skipCollisionTest: collision, layer })
        return this
    }
}
const convertToWorld = (block, tileW = 48) => {
    return { x: block.x * tileW, y: block.y * tileW, h: block.h * tileW, w: block.w * tileW }
}
class Map extends Block {
    tileW = 48
    collisionRects = []
    previewColRects = []
    objCollisionRects = []

    tempCollisionRects = []
    spawnPoints = []
    tempSpawnPoints = []
    projections = []
    checkpoints = []
    layers = {
        fg: [[]],
        og: [[]],
        mg: [[]]
    }
    collapsedTiles = {
        fg: {},
        og: {},
        mg: {}
    }
    
    bg = "#132b27"
    mob_bg = "#132b27"
    pxbg = "#0a1614"
    tint = "0.025, -0.025, -0.0125, 0"
    
    collapseTile({x, y, tile, layer="fg", worldSpace=true}) {
        const gridX = worldSpace ? x / 48: x
        const gridY = worldSpace ? y / 48: y
        if (gridX < 0 || gridY < 0 || gridX > this.w - 1 || gridY > this.h - 1) return null
        this.setTile(gridX, gridY, tile, "fg", true)
        this.collapsedTiles[layer][`${gridX}-${gridY}`] = tile
    }

    player = { name: "player", x: 0, y: 0 } // temporary player for level design (helps in focusing camera)

    centerCamera(block) {
        this.player = { name: "player", temp: true, ...calcStacked(convertToWorld(block, this.tileW), { w: 64, h: 64 }, "top") }
    }
    async save(path="./temp-map-data.json") {
        const { w, h, tint, pxbg, mob_bg, bg, tileW, player, collapsedTiles, layers, checkpoints, projections, spawnPoints, tempSpawnPoints, tempCollisionRects, objCollisionRects, previewColRects, collisionRects } = this
        await fs.writeFile(path, JSON.stringify({
            w, h, tint, pxbg, mob_bg, bg, tileW, player, collapsedTiles, layers, checkpoints, projections, spawnPoints, tempSpawnPoints, tempCollisionRects, objCollisionRects, previewColRects, collisionRects    
        }))
    }
    static async fromSaved(defaultData, path="./temp-map-data.json") {
        try {
            const data = (await readFile(path)).toString("utf-8")
            const map = new Map(defaultData)
            Object.assign(map, data)
            return map
        } catch {
            return new Map(defaultData)
        }
    }
    constructor({ width, height, ...config } = {}) {
        super(width, height)
        Object.assign(this, config)

        // Initialize the layers as 2D grids
        this.layers.fg = Array.from({ length: height }, () => Array(width).fill(null))
        this.layers.og = Array.from({ length: height }, () => Array(width).fill(null))
        this.layers.mg = Array.from({ length: height }, () => Array(width).fill(null))

        this.clear()
        CompositeBlock.registerMap(this)
    }

    clear() {
        this.layers.fg.forEach(row => row.fill(null))
        this.layers.og.forEach(row => row.fill(null))
        this.layers.mg.forEach(row => row.fill(null))
        this.collisionRects.length = 0
        Object.entries(this.collapsedTiles.fg).forEach(([ key, value ]) => {
            const [ x, y ] = key.split("-").map(i => Number(i))
            this.collapseTile({ x, y, tile: value, worldSpace: false })
        })
    }

    addPlainBlock({ block, layer = "og", skipCollisionTest = false }) {
        const x = Math.floor(block.x)
        const y = Math.floor(block.y)
        const w = Math.ceil(block.w)
        const h = Math.ceil(block.h)

        this.collisionRects.push({ x: block.x, y: block.y, w: block.w, h: block.h })
    }
    setTile(x, y, name, layer = "fg", force=false) {
        // console.log({layer, name})
        if (this.collapsedTiles[layer][`${x}-${y}`] && !force) return
        if (x < 0 || y < 0 || x > this.w - 1 || y > this.h - 1) return
        this.layers[layer][y][x] = name
    }
    getTile(x, y, layer = "fg") {
        if (x < 0 || y < 0 || x > this.w - 1 || y > this.h - 1) return null
        return this.layers[layer][y][x]
    }
    addPreviewColRects(rects) {
        rects.forEach(({ x, y, w, h }) => this.previewColRects.push({ x, y, w, h }))
    }
    clearPreviewColRects(rects) {
        this.previewColRects.length = 0
    }
    async addTempColRect(params) {
        const { x, y, name } = params
        const mat = collisionMatMap[name]
        if (!mat) return
        const getDims = require("./getDims") // dynamic import to avoid circular dependency 
        const dims = await getDims(name)
        if (dims.hitBox) {
            this.tempCollisionRects.push({ x: x + dims.hitBox.x, y: y + dims.hitBox.y, w: dims.hitBox.width, h: dims.hitBox.height, mat })
            return
        }
        if (dims.rotation) {
            this.tempCollisionRects.push({ x: x, y: y, w: dims.height, h: dims.width, mat })
            return
        }
        this.tempCollisionRects.push({ x, y, w: dims.width, h: dims.height, mat })
    }
    async addTempSpawnPoint(point) {
        if (Array.isArray(point)) {
            if (point.colRects) {
                this.tempCollisionRects.push(...point.colRects)
            }
            for (const p of point) {
                const layer = layerMap[p.name]
                if (layer) p.layer = layer
                this.tempSpawnPoints.push(p)
                await this.addTempColRect(p)
            }
        } else {
            const layer = layerMap[point.name]
            if (layer) point.layer = layer
            this.tempSpawnPoints.push(point)
            await this.addTempColRect(point)
        }
        await this.exportMap()
    }
    async clearTempSpawnPoint(exportData=true) {
        this.tempSpawnPoints.length = 0
        this.tempCollisionRects.length = 0
       if (exportData) await this.exportMap()
    }
    async commitTempSpawnPoint() {
        this.tempSpawnPoints.forEach(p => {
            if (p.name === "checkpoint") {
                this.checkpoints.push(p)
                return
            }
            this.spawnPoints.push(p)
            if (Array.isArray(p.collapsed)) { // collapse wave function (superposition state)
                p.collapsed.forEach(t => this.collapseTile({ ...t, testing: true, worldSpace: true }))
                delete p.collapsed
            }
        })
        groupAndMergeRectsByMat(this.tempCollisionRects).forEach(r => this.objCollisionRects.push(r))
        this.tempCollisionRects.length = 0
        this.tempSpawnPoints.length = 0
        await this.exportMap()
    }

    addCompositeBlock({ block, layer = "fg", skipCollisionTest }) {
        this.centerCamera(block)
        if (!(block instanceof CompositeBlock)) return
        for (const child of block.children) {
            this.addPlainBlock({ block: child, layer, skipCollisionTest: true })
        }
        if (skipCollisionTest) return
        for (const rect of block.collisionRects) {
            this.collisionRects.push({ ...rect })
        }
        this.collisionRects = mergeRects(this.collisionRects)
    }

    addBlock(params) {
        if (params.block instanceof CompositeBlock) {
            this.addCompositeBlock(params)
            return
        }
        if (params.block instanceof Block) {
            this.addPlainBlock(params)
            return
        }
        throw new Error("Invalid block:", params)
    }

    // Export the grid data for each layer as a flattened array
    async exportMap(levelName = "testlevel") {
        const { tileW, bg, mob_bg, pxbg, tint, projections, tempSpawnPoints } = this
        const flattenLayer = (layerGrid) => {
            return layerGrid.map((row, j) => {
                return row.map((cell, i) => {
                    return { name: cell, x: i * tileW, y: j * tileW }
                }).filter(cell => cell.name && cell.name !== "empty")
            }).reduce((flattened, row) => flattened.concat(row), [])
        }

        const fgTiles = flattenLayer(this.layers.fg)
        const ogTiles = flattenLayer(this.layers.og)
        const mgTiles = flattenLayer(this.layers.mg)

        const collisionRects = this.collisionRects.map(rect => {
            const { x, y, w, h, mat } = rect
            return { x: x * tileW, y: y * tileW, width: w * tileW, height: h * tileW, mat }
        })

        this.objCollisionRects.concat(this.tempCollisionRects).forEach(r => {
            collisionRects.push({ x: r.x, y: r.y, width: r.w, height: r.h, mat: r.mat })
        })

        const spawnPoints = this.spawnPoints.concat(this.player)
        const checkpoints = this.checkpoints
        const exports = {
            collisionRects,
            spawnPoints,
            checkpoints,
            tempSpawnPoints,
            fgTiles,
            tiles: ogTiles,
            mgTiles,
            bg,
            mob_bg,
            pxbg,
            tint,
            width: this.w * tileW,
            height: this.h * tileW,
            previewColRects: this.previewColRects.concat(projections),
            mxJmpVel: this.mxJmpVel,
            speed: this.speed
        }
        if (typeof this.bgPos === "string") {
            exports.bgPos = this.bgPos
        }
        await fs.writeFile(`./src/assets/levels/${levelName}.cson`, JSON.stringify(exports))
    }
}

const generateGrid = (block) => {
    const rects = block.collisionRects
    const compositeRect = { x: block.x, y: block.y, w: block.w, h: block.h }
    const grid = Array(compositeRect.w * compositeRect.h).fill(0)
    grid.width = compositeRect.width
    grid.height = compositeRect.height
    rects.forEach(rect => {
        const x = rect.x - compositeRect.x
        const y = rect.y - compositeRect.y
        for (let i = x; i < x + rect.w; i++) {
            for (let j = y; j < y + rect.h; j++) {
                const index = compositeRect.w * j + i
                grid[index] = 1
            }
        }
    })
    return Object.assign({
        grid,
        get(i, j) {
            return grid[compositeRect.w * j + i]
        }
    }, compositeRect)
}

const decomposeBlocks = block => {
    const x = Math.round(block.x)
    const y = Math.round(block.y)
    const blocks = []
    for (let i = 0; i < block.h; i++) {
        for (let j = 0; j < block.w; j++) {
            blocks.push({ x: x + j, y: y + i, w: 1, h: 1 })
        }
    }
    return blocks
}

module.exports = {
    combine,
    calcComposite,
    calcAligned,
    Block,
    CompositeBlock,
    Map,
    generateGrid,
    rand,
    weightedRand,
    skewedRand,
    pickOne,
    convertToWorld,
    decomposeBlocks
}