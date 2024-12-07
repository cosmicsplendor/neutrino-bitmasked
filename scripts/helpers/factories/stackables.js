const { pickOne, rand, CompositeBlock, Block, decomposeBlocks, weightedRand } = require("../../utils")
const STACK_TOP = ["top-start", "top-end", "top"]

const stackables = ({ name, dims }) => {
    return {
        randomize: true,
        fields: ["width", "height", "density"],
        dims: ({ width, height }) => {
            return {
                width: width * dims.width,
                height: height * dims.height
            }
        },
        createHorizontal(width, height, density) {
            const parent = new CompositeBlock(new Block(width, 1))
            let prevWidth = width
            for (let i = 1; i < height; i++) {
                const newWidth = weightedRand(0, prevWidth, density)
                prevWidth = newWidth
                parent.addPart({
                    width: newWidth, height: 1, position: pickOne(STACK_TOP), onto: "last"
                })
            }
            return parent
        },
        createVertical(width, height, density) {
            const parent = new CompositeBlock(new Block(1, height))
            let prevHeight = height
            for (let i = 1; i < width; i++) {
                const newHeight = weightedRand(0, prevHeight, density)
                parent.addPart({
                    width: 1, height: newHeight, position: "right-end", onto: "last"
                })
            }
            return parent
        },
        createBlocks(x, y, width, height, density) {
            const vertical = rand(1, 0)
            console.log(vertical ? "Vertical": "Horizontal")
            const block = vertical ? this.createVertical(width, height, density): this.createHorizontal(width, height, density)
            return block.children.flatMap(decomposeBlocks).map(b => {
                const dy = vertical ? 0: +height - 1
                return { x: x + b.x * dims.width, y: y + (b.y + dy) * dims.height, name: typeof name === "function" ? name(): name }
            })
        },
        create(params) {
            const { x, y, width, height, density } = params
            return this.createBlocks(x, y, width, height, density)
        }
    }
}

module.exports = stackables