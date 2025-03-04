import { Node } from "@lib"
import getTestFn from "./helpers/getTestFn"
import getUpdateHandler from "./helpers/getUpdateHandler"

class Collision {
    constructor({ entity, block, blocks, onHit = () => {}, rigid=false, movable=true }) { // block and blocks are both optional, but one of them must be passed
        /**
         * ------------------------------------
         *  rigid  | movable | instance | testFn
         * ------------------------------------
         *  true   |  true  |   crate  | normal
         *  true   |  false |   wall   | fixed
         *  false  |  true  |   enemy  | normal
         *  false  |  false |   zone   | normal
         */
        this.entity = entity
        this.oneToOne = Boolean(block)  && !Boolean(blocks)
        this.onHit = onHit
        this.block = block
        this.blocks = blocks
        this.evalUpdateFn = () => { 
            const blocks = Node.get(this.blocks)
            const block = Node.get(this.block)
            const sampleBlock = this.oneToOne ? block : blocks && blocks.children[0]
            if (!sampleBlock) { return }
            // inferring collision test and update functions automatically
            this.testFn = getTestFn(this.entity, sampleBlock, { rigid, movable }) 
            return getUpdateHandler(this.entity, sampleBlock, { rigid, movable, collision: this, })
        }
    }
    resolve(block, resolveFn, checkFalsePositive) {
        const yUndoneBy = checkFalsePositive && block.movable ? block.pos.y - block.prevPosY: 0
        block.pos.y -= yUndoneBy
        block.alpha !== 0 && this.testFn(this.entity, block) && resolveFn(block)
        block.pos.y += yUndoneBy
    }
    test(resolveFn, checkFalsePositive) {
        if (this.oneToOne) {
            const block = Node.get(this.block)
            this.resolve(block, resolveFn, checkFalsePositive)
            return
        }

        /**
         * if the block is movable we might get a false positive (or false negative) on x-collision test
         * setting checkFalsePositive param to true during x-collison test (after undoing entity y movement) allows us
         * to resolve that; we need to undo block y movement too so we know it's indeed movementX (or movementY)
         * that is responsible for collision
         */
        const blocks = Node.get(this.blocks)
        if (!blocks) { return }
        for (let i = blocks.children.length - 1; i > -1; i--) {
            const block = blocks.children[i]
            this.resolve(block, resolveFn, checkFalsePositive)
        }
    }
    update() { 
        const updateFn = this.evalUpdateFn() // deferring the evaluation of update function until collision block(s) materialize
        if (updateFn) { 
            this.update = updateFn
            this.evalUpdateFn = null // clearing reference to this function so it can be garbage collected
            updateFn()
        }
    }
}

export default Collision