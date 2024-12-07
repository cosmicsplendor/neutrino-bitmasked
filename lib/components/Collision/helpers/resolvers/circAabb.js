import { clamp, sign, atan } from "@utils/math"
import { rectBounds, circBounds, setLocalPosX, setLocalPosY } from "@lib/utils/entity"
import { offLeftThreshold, offRightThreshold, offEdgeReboundSpeed } from "@lib/constants"

export default  Object.freeze({
    oneOff: false,
    resolveX: (entity, block, movementX) => {
        // debugger
        if (entity.offEdge) { return }
        const blockBounds = rectBounds(block)
        const entBounds = circBounds(entity)
        const hc = entity.hitCirc
        const nearestBlockYFromEntCenter = clamp(blockBounds.y, blockBounds.y + blockBounds.height, entBounds.y + entBounds.radius)
        let xOffset = 0
        if (nearestBlockYFromEntCenter === blockBounds.y || nearestBlockYFromEntCenter === blockBounds.y + blockBounds.height) { // if the circle is off edge
            const offedge = Math.abs(nearestBlockYFromEntCenter - (entBounds.y + entBounds.radius))
            xOffset = entBounds.radius - Math.sqrt(entBounds.radius * entBounds.radius - offedge * offedge)
        }
        
        const prevPosX = entity.pos.x
        const relMovX = movementX - (block.movable ? block.pos.x - block.prevPosX: 0) // taking into consideration movement of block relative to block rather than just plain block 
        if (relMovX > 0) { // collision with the left edge
            setLocalPosX(entity, blockBounds.x - hc.x - 2 * entBounds.radius + xOffset)
        } else {
            // collision with the right edge
            setLocalPosX(entity, blockBounds.x + blockBounds.width - hc.x - xOffset)
        }
        
        const dPosX = entity.pos.x - prevPosX
        const normalizedNetMovement = (relMovX + dPosX) / relMovX
        entity.velX = xOffset ? sign(entity.velX): 0 // if there is xOffset, the ball is trying to penetrate the sides through offEdge position; in that case velocity direction has to be left intact so that the sebsequent y-collision logic can know off which edge to set on entity 
        entity.rotation = entity.prevRot + normalizedNetMovement * (entity.rotation - entity.prevRot)
    },
    resolveY: (entity, block, movementY) => { // returns a boolean indicating whether the entity is falling
        if (entity.offEdge) { return }
        const blockBounds = rectBounds(block)
        const hc = entity.hitCirc
        const entBounds = circBounds(entity)
        const nearestBlockXFromEntCenter = clamp(blockBounds.x, blockBounds.x + blockBounds.width, entBounds.x + entBounds.radius)
        const relMovY = movementY - (block.movable ? block.pos.y - block.prevPosY: 0)
        let yOffset = 0
        if (nearestBlockXFromEntCenter === blockBounds.x || nearestBlockXFromEntCenter === blockBounds.x + blockBounds.width) { // if the circle is off edge
            const offedge = Math.abs(nearestBlockXFromEntCenter - (entBounds.x + entBounds.radius))
            yOffset = entBounds.radius - Math.sqrt(entBounds.radius * entBounds.radius - offedge * offedge)
        }
        entity.velY = !!block.movable && block.velY > 0 ? block.velY: 0 
        if (relMovY > 0) { // collision with the top edge
            let falling = false
            if (yOffset) {
                const offWhichEdge = nearestBlockXFromEntCenter === blockBounds.x ? -1: 1
                const movingAway = sign(entity.velX) === offWhichEdge
                if (movingAway) { 
                    entity.velX += offWhichEdge * 2 // prevent the ball from sticking to the corner                                                 
                    falling = true
                } else { // if the entity isn't moving away from the corner
                    entity.offEdge = offWhichEdge
                    entity.offCorner = block
                    const angle = atan(blockBounds.y - (entBounds.y + entBounds.radius), blockBounds.x + (offWhichEdge === 1 ? blockBounds.width: 0) - (entBounds.x + entBounds.radius))
                    // if far enough off-edge to topple, move the entity to non-colliding state

                    if (offWhichEdge === -1 && angle < offLeftThreshold || offWhichEdge === 1 && angle > offRightThreshold) { 
                        entity.velX = offWhichEdge * Math.max(offEdgeReboundSpeed, Math.abs(entity.velX))
                    }
                }
            }
            setLocalPosY(entity, blockBounds.y - hc.y - 2 * entBounds.radius + yOffset)
            return falling
        }
        // collision with the bottom edge
        setLocalPosY(entity, blockBounds.y + blockBounds.height - hc.y - yOffset)
    }
})
