import { aabbCirc, aabb, fixedAabb, circCirc } from "@lib/utils/math"
import { shapes, detectShape, rectBounds, circBounds } from "@lib/utils/entity"

export const getAabbTestFn = fixed => {
    const test = fixed ? fixedAabb: aabb
    return (e1, e2) => {
        const e1Bounds = rectBounds(e1)
        const e2Bounds = rectBounds(e2)
        return test(e1Bounds, e2Bounds)
    }
}

export const testCircCirc = (e1, e2) => {
    const e1Bounds = circBounds(e1)
    const e2Bounds = circBounds(e2)
    return circCirc(e1Bounds, e2Bounds)
}


export const testCircAabb = (circ, aabb) => {
    return aabbCirc(rectBounds(aabb), circBounds(circ))
}

export const testAabbCirc = (aabb, circ) => {
    return aabbCirc(rectBounds(aabb), circBounds(circ))
}

export default (e1, e2, opts) => {
    const e1Shape = detectShape(e1)
    const e2Shape = detectShape(e2)
    const fixed = opts && opts.rigid && opts.movable

    if (e1Shape === shapes.RECT && e2Shape === shapes.RECT) {
        return getAabbTestFn(fixed)
    } 
    if (e1Shape === shapes.CIRC && e2Shape === shapes.CIRC) {
        return testCircCirc
    } 
    if (e1Shape === shapes.CIRC && e2Shape === shapes.RECT) {
        return testCircAabb
    }
    if (e1Shape === shapes.RECT && e2Shape === shapes.CIRC) {
        return testAabbCirc
    }
}
