import { TexRegion, Node } from "@lib"
import { len, atan, easingFns } from "@utils/math"

const mapBoneToTexRegion = bone => {
    const { name, startingPoint = { x: 0, y: 0 }, endPoint = { x: 0, y: 0 }, parentName, zIndex } = bone
    const texRegion = new TexRegion({ frame: name.replace(/_d[0-9]+$/, "") })

    const boneVecX = endPoint ? endPoint.x - startingPoint.x : 0
    const boneVecY = endPoint ? endPoint.y - startingPoint.y : 0
    texRegion.name = name
    texRegion.anchor = { ...startingPoint }
    texRegion.length = len(boneVecX, boneVecY)
    texRegion.angle = atan(boneVecY, boneVecX)
    texRegion.parentName = parentName
    texRegion.childBones = []
    texRegion.zIndex = zIndex

    return texRegion
}
const findAnchorBone = (bone, prevState) => {
    if (prevState.imports[bone.name]?.isAnchor) return bone

    for (const childBone of bone.childBones) {
        const anchorBone = findAnchorBone(childBone, prevState)
        if (anchorBone) return anchorBone
    }

    return null
}
const buildSkeletalSceneGraph = bones => {
    bones.forEach(bone => {
        if (!bone.parentName) return
        const parentBone = bones.find(({ name }) => {
            return name === bone.parentName
        })
        parentBone.childBones.push(bone)
    })

    const rootBone = bones.find(bone => bone.childBones.length && !bone.parentName)
    return rootBone
}

const calcAbsAngle = (boneName, animState, animStates) => {
    const parentState = animStates.find(state => {
        return animState.parentId === state.id
    })
    const { delAngularPos, angleMultiplier } = animState.imports[boneName]
    const curAngle = delAngularPos * angleMultiplier
    if (!parentState) return curAngle
    return curAngle + calcAbsAngle(boneName, parentState, animStates)
}
const boneX = bone => {
    return bone.pos.x + bone.anchor.x + bone.length * Math.cos(bone.angle)
}
const boneY = bone => {
    return bone.pos.y + bone.anchor.y + bone.length * Math.sin(bone.angle)
}
class BoneAnimNode extends Node {
    _playing = false
    elapsedTime = 0
    queue = [] // Queue to hold state transitions
    curAnim = null // Keep track of the current animation state
    xOffset = 0
    get playing() {
        return this._playing
    }
    constructor({ data, ...rest }) {
        super({ ...rest })
        this.syncroNode = new Node()
        this.syncroNode.scale = { x: 1, y: 1 }
        this.add(this.syncroNode)

        const { bones: boneData, animStates } = data
        this.states = animStates
        this.bones = boneData.map(mapBoneToTexRegion)
        this.rootBone = buildSkeletalSceneGraph(this.bones)
        this.sortAndAddBones(this.bones)
    }

    sortAndAddBones(bones) {
        bones.sort((a, b) => {
            const aZIndex = Number(a.zIndex) || 0
            const bZIndex = Number(b.zIndex) || 0
            return aZIndex - bZIndex
        })
        bones.forEach(bone => {
            this.syncroNode.add(bone)
        })
    }

    syncRecursively(bone = this.rootBone, globalAnchorPos = { x: 0, y: 0 }, globalAngularPos = 0) {
        const { angularPos, anchor } = bone
        bone.pos.x = globalAnchorPos.x - anchor.x
        bone.pos.y = globalAnchorPos.y - anchor.y
        bone.rotation = angularPos + globalAngularPos
        const netAngle = bone.angle + bone.rotation

        const newGlobalPos = { ...globalAnchorPos }
        newGlobalPos.x += bone.length * Math.cos(netAngle)
        newGlobalPos.y += bone.length * Math.sin(netAngle)

        bone.childBones.forEach(childBone => {
            this.syncRecursively(childBone, newGlobalPos, bone.rotation)
        })
    }
    locatePointOnBone({ boneName, normX, normY }) {
        const bone = this.bones.find(bone => bone.name === boneName)
        if (!bone) {
            throw new Error(`Non existent bone: ${boneName}`)
        }
        const globalPosX = this.pos.x + bone.pos.x
        const globalPosY = this.pos.y + bone.pos.y
        const transformOriginX = globalPosX + bone.anchor.x
        const transformOriginY = globalPosY + bone.anchor.y
        const pointX = bone.w * normX - bone.anchor.x
        const pointY = bone.h * normY - bone.anchor.y
        const pointAngle = atan(pointY, pointX)
        const pointVecLen = len(pointX, pointY)
        return {
            x: transformOriginX + pointVecLen * Math.cos(pointAngle + bone.rotation),
            y: transformOriginY + pointVecLen * Math.sin(pointAngle + bone.rotation)
        }
    }

    play(to, from) {
        if (!this.rootBone) return
        this.queue.length = 0
        // Add a transition back to the `from` state if there is an ongoing animation
        if (this.curAnim && this.curAnim !== from) {
            this.queue.push({ from: this.curAnim, to: from })
        }

        // Enqueue the new state transition
        this.queue.push({ from, to })

        // If already playing, no need to start a new transition immediately
        if (this._playing) return

        // Start processing the first transition in the queue
        this.startNextTransition()
    }

    startNextTransition() {
        if (!this.queue.length) {
            this._playing = false
            return
        }
        const { from, to } = this.queue.shift()
        this.curState = this.states.find(state => state.name === to)
        this.prevState = this.states.find(state => state.name === from) || this.curState
        this.maxDuration = 0
        this.bones.forEach(bone => {
            const angularPos = calcAbsAngle(bone.name, this.curState, this.states)
            const prevAngularPos = calcAbsAngle(bone.name, this.prevState, this.states)
            const { easingFn, delay, period } = this.curState.imports[bone.name]
            bone.netPeriod = delay + period
            bone.delay = delay
            bone.period = period
            bone.easingFn = easingFn
            bone.angularPos = prevAngularPos
            bone.baseAngularPos = prevAngularPos
            bone.delAngularPos = angularPos - prevAngularPos
            this.maxDuration = Math.max(this.maxDuration, period + delay)
        })
        this.curAnim = to // Update the current state
        this.prevAnim = from
        this._playing = true
        this.elapsedTime = 0
    }

    update(dt) {
        if (!this._playing) return
        this.elapsedTime += dt

        this.bones.forEach(bone => {
            const { easingFn, period, delay = 0, baseAngularPos, delAngularPos } = bone
            if (delAngularPos === 0) {
                return
            }
            const t = this.elapsedTime - delay
            if (t < 0) return
            const progress = Math.min(t / period, 1)
            bone.angularPos = baseAngularPos + delAngularPos * easingFns[easingFn](progress)
        })

        if (this.elapsedTime >= this.maxDuration) {
            this.elapsedTime = 0
            const lastAnchorBone = findAnchorBone(this.rootBone, this.prevState)
            const anchorBone = findAnchorBone(this.rootBone, this.curState)
            this.xOffset += (boneX(anchorBone) - boneX(lastAnchorBone)) * this.syncroNode.scale.x
            if (this.queue.length) {
                // Start the next state transition in the queue
                this.startNextTransition()
            } else {
                // Looping logic (retain previous behavior)
                const prevAnim = this.curAnim
                this.curAnim = this.prevAnim
                this.prevAnim = prevAnim
                this.curState = this.states.find(state => state.name === this.curAnim)
                this.prevState = this.states.find(state => state.name === this.prevAnim)
                this.bones.forEach(bone => {
                    const { period, delay, netPeriod, baseAngularPos, delAngularPos } = bone
                    bone.baseAngularPos = baseAngularPos + delAngularPos
                    bone.angularPos = bone.baseAngularPos
                    bone.delAngularPos = -delAngularPos
                    bone.delay = netPeriod - (period + delay)
                })
            }
        }
        // After sync, sync anchor bone
        this.syncRecursively(this.rootBone)
        const anchorBone = findAnchorBone(this.rootBone, this.prevState)
        //  throw new Error()
        if (anchorBone) {
            this.syncroNode.pos.x = -boneX(anchorBone) * this.syncroNode.scale.x + this.xOffset
            this.syncroNode.pos.y = -boneY(anchorBone)
        }
    }
}

export default BoneAnimNode