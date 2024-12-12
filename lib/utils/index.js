import { pickOne } from "./math"

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
        const nextNode = this.objGraph.next();
        if (!nextNode) {
            this.transition();
            return stateMachine.generate();
        }

        const { name, gap, dims, flip } = nextNode;

        const numBases = Math.ceil((dims.width + gap) / stateMachine.baseWidth);
        const tiles = [];

        for (let i = 0; i < numBases; i++) {
            for (let j = 0; j < this.height; j++) {
                console.log("HERE")
                tiles.push({
                    t: "base",
                    x: stateMachine.curX + i * stateMachine.baseWidth,
                    y: -(j + 1) * stateMachine.baseHeight
                });
            }
        }

        tiles.push({
            t: name,
            x: stateMachine.curX,
            y: -dims.height - this.height * stateMachine.baseHeight,
            flip: flip
        });

        stateMachine.curX += numBases * stateMachine.baseWidth;

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
        for (const name of nodeNames) {
            this.nodes.set(name, []);
        }
    }

    addEdge(src, dest, gap = 0, weight = 1) {
        if (this.nodes.has(src)) {
            this.nodes.get(src).push({ dest, gap, weight });
        }
    }

    setInitialNode(nodeName) {
        if (!this.initialNodes.includes(nodeName)) {
            this.initialNodes.push(nodeName);
        }
    }

    next() {
        if (this.currentNode === undefined) {
            if (this.initialNodes.length === 0) return null;
            this.currentNode = this.initialNodes[0]; // Start with the first initial node
            return this._formatNextNode(this.currentNode);
        }

        const edges = this.nodes.get(this.currentNode) || [];
        if (edges.length === 0) {
            // If no edges, treat as terminal
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
        return {
            name: flipped ? nodeName.slice(0, -7): nodeName,
            flip: flipped,
            gap,
            dims: this.dimsMap[nodeName] || { w: 0, h: 0 },
        };
    }
}
