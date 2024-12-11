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
    constructor(areaConstructors, baseWidth=48, baseHeight=64) {
        this.states = areaConstructors.reduce((map, Constructor) => {
            map[Constructor.name] = new Constructor(this);
            return map;
        }, {});
        this.baseWidth = baseWidth
        this.baseHeight = baseHeight
        this.currentArea = null; // Active state
        this.curX = 0; // Current X position
    }

    setInitialArea(C) {
        this.currentArea = typeof C === "string" ? this.states[C] : this.states[C.name];
    }

    generate() {
        if (!this.currentArea) {
            this.currentArea = this.states
        }
        return this.currentArea.generate();
    }

    transition(areaConstructorName) {
        if (!this.currentArea) {
            this.currentArea = pickOne(Object.values(this.states))
        }
        this.currentArea = new areaConstructorName(this);
    }
}

export class BiomeGen {
    constructor(stateMachine) {
        this.stateMachine = stateMachine;
        this.transitions = [];
        this.objGraph = new ObjGraph();
        this.height = 1; // Default height
    }

    addTransition(areaConstructorName, weight) {
        this.transitions.push({ area: areaConstructorName, weight });
    }

    transition() {
        const totalWeight = this.transitions.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;
        for (const t of this.transitions) {
            random -= t.weight;
            if (random <= 0) {
                this.stateMachine.transition(t.area);
                return;
            }
        }
    }

    generate() {
        const { stateMachine } = this;
        const nextNode = this.ObjGraph.next();
        if (!nextNode) {
            this.transition();
            return stateMachine.generate();
        }

        const { name, gap, dims } = nextNode;

        const numBases = Math.ceil((dims.w + gap) / stateMachine.baseWidth);
        const tiles = [];

        for (let i = 0; i < numBases; i++) {
            for (let j = 0; j < this.height; j++) {
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
            y: -dims.h - this.height * baseHeight,
        });

        stateMachine.curX += numBases * baseWidth;

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
        const flipped = nodeName.startsWith("flip_");
        return {
            name: flipped ? nodeName.slice(5): nodeName,
            flip: flipped,
            gap,
            dims: this.dimsMap[nodeName] || { w: 0, h: 0 },
        };
    }
}
