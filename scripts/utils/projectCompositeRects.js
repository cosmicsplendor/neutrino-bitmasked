const {findNearestCollision} = require("./detectProjectedEmptySpaces")
const {generateGrid} = require("./index")

class XPointer {
    edges = []
    constructor(normalDir) {
        this.normal = normalDir
    }
    eneumerate() {
        return this.edges.map(e => {
            const { x1, y1, x2 } = e
            return { x: x1, y: y1, w: x2 - x1, h: 0, normal: this.normal }
        })
    }
    record(x, y) {
        const lastEdge = this.edges[this.edges.length - 1]
        const extendExisting = y === lastEdge?.y2

        if (extendExisting) {
            lastEdge.x2 = x + 1
            return
        }

        this.edges.push({ x1: x, y1: y, x2: x + 1, y2: y })
    }
}
class YPointer {
    edges = []
    constructor(normalDir) {
        this.normal = normalDir
    }
    eneumerate() {
        return this.edges.map(e => {
            const { x1, y1, y2 } = e
            return { x: x1, y: y1, w: 0, h: y2 - y1, normal: this.normal }
        })
    }
    record(x, y) {
        const lastEdge = this.edges[this.edges.length - 1]
        const extendExisting = x === lastEdge?.x2

        if (extendExisting) {
            lastEdge.y2 = y + 1
            return
        }

        this.edges.push({ x1: x, y1: y, x2: x, y2: y + 1 })
    }
}

const computeEdges = block => {
    const grid = generateGrid(block)
    const topPointer = new XPointer("top")
    const bottomPointer = new XPointer("bottom")
    const leftPointer = new YPointer("left")
    const rightPointer = new YPointer("right")
    for (let x = 0; x < grid.w; x++) {
        let ytop = 0, ybottom = grid.h - 1
        while (!grid.get(x, ytop) && ytop < grid.h) {
            ytop++
        }
        topPointer.record(x, ytop)
        while (!grid.get(x, ybottom) && ytop > -1) {
            ybottom--
        }
        bottomPointer.record(x, ybottom + 1)
    }

    for (let y = 0; y < grid.h; y++) {
        let xleft = 0, xright = grid.w - 1
        while (!grid.get(xleft, y) && xright < grid.w) {
            xleft++
        }
        leftPointer.record(xleft, y)
        while (!grid.get(xright, y) && xright > -1) {
            xright--
        }
        rightPointer.record(xright + 1, y)
    }
    return [rightPointer, leftPointer, topPointer, bottomPointer]
        .flatMap(p => {
            return p.eneumerate()
        })
        .map(e => {
            e.x += grid.x
            e.y += grid.y
            return e
        })
}

const projectCompositeRects = (compositeBlock, collisionRects, map) => {
    const edges = computeEdges(compositeBlock); // Assume this computes the edges of the composite rects

    return edges.map(edge => {
        const isHorizontal = edge.normal === "left" || edge.normal === "right";
        
        const nearestCollision = findNearestCollision(edge.normal, isHorizontal, collisionRects, edge, map);
        // Now, based on the edge's normal, calculate the projected empty space
        if (edge.normal === "left") {
            // Project leftwards
            return {
                x: nearestCollision,
                y: edge.y,
                w: Math.max(0, edge.x - nearestCollision),
                h: edge.h,
                normal: edge.normal
            };
        } else if (edge.normal === "right") {
            // Project rightwards
            return {
                x: edge.x + edge.w,
                y: edge.y,
                w: Math.max(0, nearestCollision - (edge.x + edge.w)),
                h: edge.h,
                normal: edge.normal
            };
        } else if (edge.normal === "top") {
            // Project upwards
            return {
                x: edge.x,
                y: nearestCollision,
                w: edge.w,
                h: Math.max(0, edge.y - nearestCollision),
                normal: edge.normal
            };
        } else if (edge.normal === "bottom") {
            // Project downwards
            return {
                x: edge.x,
                y: edge.y + edge.h,
                w: edge.w,
                h: Math.max(0, nearestCollision - (edge.y + edge.h)),
                normal: edge.normal
            };
        }
    }).filter(p => p.h !==0 && p.w !== 0)
};


module.exports = projectCompositeRects