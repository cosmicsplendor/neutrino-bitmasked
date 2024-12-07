import { IMatrix } from "./utils/Matrix"
const createMatStackMixin = (matrixUtil) => {
    const mixin = {}
    mixin.mStack = []
    mixin.mStack.push(IMatrix.create()) // identity matrix
    mixin.curMatIdx = 0
    mixin.curMat = mixin.mStack[0]
    mixin.firstMat = mixin.mStack[0]
    mixin.getCurMat = function() {
        return this.curMat
    }
    mixin.save = function() {
        this.curMatIdx += 1
        this.mStack[this.curMatIdx] =  this.mStack[this.curMatIdx] || IMatrix.create()
        this.curMat = this.mStack[this.curMatIdx]
        // copying previous matrix into the current one (can be interpreted as cloning the previous matrix and pushing it into the stack)
        const prev = this.mStack[this.curMatIdx - 1]
        for (let i = 0; i < 9; i++) {
            this.curMat[i] = prev[i]
        }
    }
    mixin.restore = function() {
        if (this.curMatIdx === 0) {
            throw new Error("couldn't restore state: no save point could be found")
        }
        // unwinding the matrix (popping the stack)
        this.curMatIdx -= 1
        this.curMat = this.mStack[this.curMatIdx]
    }
    return mixin
}

export default createMatStackMixin