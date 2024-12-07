import { shapes, detectShape } from "@lib/utils/entity"
import aabbResolver from "./resolvers/aabb"
import circAabbResolver from "./resolvers/circAabb"

export default (entity, block, movable) => {
    const entityShape = detectShape(entity)
    const blockShape = detectShape(block)
    if (entityShape === shapes.RECT && blockShape === shapes.RECT) {
        return aabbResolver
    }
    if (entityShape === shapes.CIRC && blockShape === shapes.RECT) {
        return circAabbResolver
    } 
    throw new Error(`No resolver found for shapes ${entityShape} and ${blockShape}`)
}