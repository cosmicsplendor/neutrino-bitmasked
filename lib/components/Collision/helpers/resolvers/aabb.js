import { rectBounds, getHitbox, setLocalPosX, setLocalPosY } from "@lib/utils/entity"

export default  Object.freeze({
    oneOff: false, // indicating the collison resolution happens component-wise
    resolveX: (entity, block, movementX, movable) => {
        const blockBounds = rectBounds(block)
        const hb = getHitbox(entity)
        entity.velX = movable ? entity.velX: 0
        movable && (block.unduePosXUpdate = movementX * 0.5)
        if (movementX > 0) { // collision with the left edge
            setLocalPosX(entity, blockBounds.x - hb.width - hb.x)
            return
        }
        // collision with the right edge
        setLocalPosX(entity, blockBounds.x + blockBounds.width - hb.x)
    },
    resolveY: (entity, block, movementY) => {
        const blockBounds = rectBounds(block)
        const hb = getHitbox(entity)
        entity.velY = 0
        if (movementY > 0) { // collision with the top edge
            setLocalPosY(entity, blockBounds.y - hb.height - hb.y)
            return
        }
        // collision with the bottom edge
        setLocalPosY(entity, blockBounds.y + blockBounds.height - hb.y )
    }
})
