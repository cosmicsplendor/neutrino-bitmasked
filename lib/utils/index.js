import { pickOne, rand } from "./math"
import { TexRegion } from "@lib/entities"
import config from "@config"

const dupeRegex = /_dupe\d+$/

const validateOrientation = mode => mode === "landscape" || mode === "portrait"
export const orient = mode => {
    const isValid = validateOrientation(mode)
    if (!isValid) {
        throw new Error(`Requested an invalid orientation mode: ${mode}`)
    }
    try {
        const curMode = screen.orientation
        const modeRegex = new RegExp(`${mode}`)
        if (modeRegex.test(curMode)) {
            return
        }
        screen.orientation.lock(mode).catch(() => { })
    } catch (e) { }
}
export const wait = s => {
    return new Promise((resolve) => {
        setTimeout(resolve, s * 1000)
    })
}

export class BGenMachine {
    constructor(biomeConstructors, dimsMap, entityMap, baseWidth = 48, baseHeight = 64) {
        this.entityMap = entityMap
        this.states = biomeConstructors.reduce((map, Constructor) => {
            map[Constructor.name] = new Constructor(this, dimsMap);
            return map;
        }, {});
        this.baseWidth = baseWidth
        this.baseHeight = baseHeight
        this.currentBiome = null; // Active state
        this.curX = 0; // Current X position
        this.excessX = -50
    }
    reset(state) {
        this.curX = 0
        this.currentBiome = this.states[state]
        this.initialBiome = this.currentBiome
    }
    setInitialBiome(C) {
        this.currentBiome = typeof C === "string" ? this.states[C] : this.states[C.name];
        this.initialBiome = this.currentBiome
    }
    mapToEntities(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i]
            const Entity = this.entityMap[tile.t] || TexRegion
            const entity = new Entity({ frame: tile.t, pos: { x: tile.x, y: config.viewport.height  + tile.y }})
            if (tile.flip) {
                entity.scale = { x: -1, y: 1 }
            }
            entity.y0 = tile.y
            tiles[i] = entity
        }
        return tiles
    }
    generate(raw) {
        if (!this.currentBiome) {
            this.currentBiome = this.initialBiome
            if (!this.currentBiome) {
                throw new Error("No initial biome set")
            }
        }
        const tiles = this.currentBiome.generate()
        return raw ? tiles: this.mapToEntities(tiles);
    }
    generateMinWidth(width) {
        const targetX = this.curX + width
        const tiles = []
        while (this.curX < targetX) {
            tiles.push(...this.generate())
        }
        return tiles
    }
    transition(name) {
        if (!this.currentBiome) {
            this.currentBiome = pickOne(Object.values(this.states))
        }
        this.currentBiome = this.states[name];
    }
}

export class BiomeGen {
    height = 1; // Default height
    constructor(stateMachine, dimsMap) {
        this.stateMachine = stateMachine;
        this.transitions = [];
        this.objGraph = new ObjGraph(dimsMap);
    }

    addTransition(name, weight) {
        this.transitions.push({ biome: name, weight });
    }

    transition() {
        const totalWeight = this.transitions.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;
        for (const t of this.transitions) {
            random -= t.weight;
            if (random <= 0) {
                this.stateMachine.transition(t.biome);
                return;
            }
        }
    }
    generate() {
        const { stateMachine } = this;
        const { baseWidth, baseHeight } = stateMachine
        const nextNode = this.objGraph.next();
        if (!nextNode) {
            const lastH = this.height
            this.transition();
            const curH = stateMachine.currentBiome.height
            if (curH < lastH) {
                const dh = lastH - curH
                stateMachine.excessX = -dh * baseWidth - 24
                const curX = stateMachine.curX
                const results = stateMachine.generate(true);
                for (let row = 1; row < dh + 1; row++) {
                    const frame = (row % 2 === (dh > 1 ? 0 : 1)) ? "arch1" : "half_base"
                    results.push({ t: frame, y: - (curH + row - 1) * baseHeight - this.objGraph.dimsMap[frame].height, x: curX + (dh - row) * baseWidth })
                    for (let col = row + 1; col < dh + 1; col++) {
                        results.push({ t: "base", y: - (curH + row) * baseHeight, x: curX + (dh - col) * baseWidth })
                    }
                }
                return results
            } else {
                const dh = curH - lastH
                const curX = stateMachine.curX
                stateMachine.curX += dh * baseWidth
                stateMachine.excessX = -48
                const results = stateMachine.generate(true)
                for (let row = 0; row < dh; row++) {
                    const frame = (row % 2 === (dh > 1 ? 1 : 0)) ? "arch1" : "half_base"
                    const { height } = this.objGraph.dimsMap[frame]
                    results.push({ t: frame, y: - (lastH + row) * baseHeight - height, x: curX + row * baseWidth + baseWidth, flip: true })
                    for (let col = row + 1; col < dh + 1; col++) {
                        results.push({ t: "base", y: - (lastH + row + 1) * baseHeight, x: curX + col * baseWidth })
                    }
                }
                for (let i = 0; i < dh; i++) {
                    for (let j = 0; j < lastH; j++) {
                        results.push({
                            t: "base",
                            x: curX + i * baseWidth,
                            y: -(j + 1) * baseHeight
                        });
                    }
                }
                return results
            }
        }

        const { name, gap, dims, flip } = nextNode;

        const numBases = Math.ceil((dims.width + gap - stateMachine.excessX) / baseWidth);
        const tiles = [];
        for (let i = 0; i < numBases; i++) {
            for (let j = 0; j < this.height; j++) {
                tiles.push({
                    t: "base",
                    x: stateMachine.curX + i * baseWidth,
                    y: -(j + 1) * baseHeight
                });
            }
        }
        tiles.push({
            t: name,
            x: gap + stateMachine.curX - stateMachine.excessX + (flip ? dims.width : 0),
            y: -dims.height - this.height * baseHeight,
            flip: flip
        });
        const extension = numBases * baseWidth
        stateMachine.excessX = extension - (dims.width + gap - stateMachine.excessX)
        stateMachine.curX += extension;

        return tiles;
    }
}

export class ObjGraph {
    repeatingNodes={}
    constructor(dimsMap = {}) {
        this.dimsMap = dimsMap;
        this.nodes = new Map();
        this.currentNode = undefined;
        this.initialNodes = [];
    }
    addNode(nodeName) {
        let baseName = nodeName;
        if (nodeName.endsWith("_flipped")) {
            baseName = nodeName.slice(0, -8);
        }
        // Remove _dupe[0-9]+ if present
        const dupeMatch = baseName.match(/_dupe\d+$/);
        if (dupeMatch) {
            baseName = baseName.slice(0, -dupeMatch[0].length);
        }

        if (!this.dimsMap.hasOwnProperty(baseName)) {
            throw new Error(`Dimension data for node '${baseName}' (original name: '${nodeName}') is missing in dimsMap.`);
        }
        this.nodes.set(nodeName, []);
    }
    addNodes(nodeNames) {
        for (const nodeName of nodeNames) {
            this.addNode(nodeName)
        }
    }
    addEdge(src, dest, gap = 0, weight = 1, reps = 0) {
        if (this.repeatingNodes[src]) {
            this.nodes.get(this.repeatingNodes[src]).push({ weight, src, dest, gap })
            return
        }
        reps = Array.isArray(reps) ? rand(reps[1], reps[0]): reps
        if (reps > 0 && src === dest) {
            const srcNode = this.nodes.get(src)
            const leftover = [...srcNode]
            srcNode.length = 0
            let lastNode = src
            for (let i = 0; i < reps-1; i++) {
                const newNode = `${src}_dupe${i}`
                if (this.nodes.has(newNode)) {
                    throw new Error(`[${src}] Repeating nodes can't have duplicates`)
                }
                this.addNode(newNode)
                this.addEdge(lastNode, newNode, gap)
                lastNode = newNode
            }
            this.repeatingNodes[src] = lastNode
            this.nodes.get(lastNode).push(...leftover)
            return
        }
        if (!this.nodes.has(src)) {
            throw new Error(`Source node '${src}' does not exist.`);
        }
        if (!this.nodes.has(dest)) {
            throw new Error(`Destination node '${dest}' does not exist.`);
        }
        const node = this.nodes.get(src)
        node.push({ dest, gap, weight })
    }

    addInitialNode(nodeName) {
        if (!this.nodes.has(nodeName)) {
            throw new Error(`Initial node '${nodeName}' does not exist.`);
        }
        if (!this.initialNodes.includes(nodeName)) {
            this.initialNodes.push(nodeName);
        }
    }
    chain(nodes = []) {
        for (let i = 0; i < nodes.length; i++) {
            if (i === nodes.length - 1) return
            const src = nodes[i]
            const dest = nodes[i + 1]
            this.addEdge(src, dest)
        }
    }
    next() {
        if (this.currentNode === undefined) {
            if (this.initialNodes.length === 0) return null;
            this.currentNode = pickOne(this.initialNodes);
            return this._formatNextNode(this.currentNode);
        }

        const edges = this.nodes.get(this.currentNode) || [];
        if (edges.length === 0) {
            this.currentNode = undefined;
            return null;
        }

        const totalWeight = edges.reduce((sum, e) => sum + e.weight, 0);
        let random = Math.random() * totalWeight;
        for (const edge of edges) {
            random -= edge.weight;
            if (random <= 0) {
                this.currentNode = edge.dest;
                return this._formatNextNode(this.currentNode, edge.gap);
            }
        }

        return null;
    }

    _formatNextNode(nodeName, gap = 0) {
        const flipped = nodeName.endsWith("_flipped");
        let name = flipped ? nodeName.slice(0, -8) : nodeName;

        // Remove _dupe[0-9]+ if present
        const dupeMatch = name.match(dupeRegex);
        if (dupeMatch) {
            name = name.slice(0, -dupeMatch[0].length);
        }

        const randGap = Array.isArray(gap) ? rand(gap[1], gap[0]) : gap;
        return {
            name: name,
            flip: flipped,
            gap: randGap,
            dims: this.dimsMap[name] || { w: 0, h: 0 },
        };
    }
}
