import { pickOne, rand } from "./math"

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
        screen.orientation.lock(mode).catch(() => {})
    } catch (e) {  }
}
export const wait = s => {
    return new Promise((resolve) => {
        setTimeout(resolve, s * 1000)
    })
}

export class BGenMachine {
    constructor(biomeConstructors, dimsMap, baseWidth=48, baseHeight=64) {
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

    generate() {
        if (!this.currentBiome) {
            this.currentBiome = this.initialBiome
            if (!this.currentBiome) {
                throw new Error("No initial biome set")
            }
        }
        return this.currentBiome.generate();
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
            stateMachine.excessX = -48
            if (curH < lastH) {
                const dh = lastH - curH
                stateMachine.excessX = -dh * baseWidth - 24
                const curX = stateMachine.curX
                const results = stateMachine.generate();
                const dimsMap = this.objGraph.dimsMap
                for (let row = 1; row < dh + 1; row++) {
                    const frame = row % 2 === 1 ? "arch1": "half_base"
                    results.push({ t: frame, y: - (curH + row - 1) * baseHeight - dimsMap[frame].height, x: curX + (dh - row) * baseWidth})
                    for (let col = row + 1; col < dh + 1; col++) {
                        results.push({ t: "base", y: - (curH + row) * baseHeight, x: curX + (dh - col) * baseWidth})
                    }
                }
                return results
            }
            return stateMachine.generate()
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
            x: gap + stateMachine.curX - stateMachine.excessX + (flip ? dims.width: 0),
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
    constructor(dimsMap = {}) {
        this.dimsMap = dimsMap;
        this.nodes = new Map();
        this.currentNode = undefined;
        this.initialNodes = [];
    }

    addNodes(nodeNames) {
        for (const nodeName of nodeNames) {
            const baseName = nodeName.endsWith("_flipped") ? nodeName.slice(0, -8) : nodeName;
            if (!this.dimsMap.hasOwnProperty(baseName)) {
                throw new Error(`Dimension data for node '${baseName}' (or '${nodeName}') is missing in dimsMap.`);
            }
            this.nodes.set(nodeName, []);
        }
    }
    addEdge(src, dest, gap = 0, weight = 1) {
        if (!this.nodes.has(src)) {
            throw new Error(`Source node '${src}' does not exist.`);
        }
        if (!this.nodes.has(dest)) {
            throw new Error(`Destination node '${dest}' does not exist.`);
        }
        this.nodes.get(src).push({ dest, gap, weight });
    }

    setInitialNode(nodeName) {
        if (!this.nodes.has(nodeName)) {
            throw new Error(`Initial node '${nodeName}' does not exist.`);
        }
        if (!this.initialNodes.includes(nodeName)) {
            this.initialNodes.push(nodeName);
        }
    }
    chain(nodes=[]) {
        for (let i = 0; i < nodes.length; i++) {
            if (i===nodes.length-1) return
            const src=nodes[i]
            const dest=nodes[i+1]
            this.addEdge(src, dest)
        }
    }
    next() {
        if (this.currentNode === undefined) {
            if (this.initialNodes.length === 0) return null;
            this.currentNode = this.initialNodes[0]; 
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
        const name = flipped ? nodeName.slice(0, -8): nodeName;
        const randGap = Array.isArray(gap) ?  rand(gap[1], gap[0]): gap
        return {
            name: name,
            flip: flipped,
            gap: randGap,
            dims: this.dimsMap[name] || { w: 0, h: 0 },
        };
    }
}
