import { rectBounds, circBounds } from "@lib/utils/entity"

export default  Object.freeze({
    oneOff: true, // indicating the collison resolution happens component-wise
    resolve: (entity, block) => {
        const blockBounds = rectBounds(block)
        const entBounds = circBounds(entity)
        const vecBEX = (entBounds.x + entBounds.radius) - blockBounds.x
        const vecBEY = (entBounds.y + entBounds.radius) - blockBounds.y
        const normalDist = block.normalX * vecBEX + block.normalY * vecBEY // 1D vector
        const penetrationDepth = entBounds.radius - normalDist

        entity.pos.x += block.normalX * penetrationDepth
        entity.pos.y += block.normalY * penetrationDepth

        entity.inclination = block
    },
})
