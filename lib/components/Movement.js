import { circBounds, rectBounds, setLocalPosX, setLocalPosY } from "@utils/entity"
import { atan } from "@utils/math"
import { offEdgeToppleSpeed, offLeftThreshold, offRightThreshold } from "@lib/constants"
export default class Movement {
    static makeMovable(entity, { velX=0, velY=0, accX, accY, fricX, fricY, roll }={}) {
        Object.assign(entity, {
            movable: true,
            velX,
            velY,
            accX, accY, fricX, fricY, roll
        })
        if (roll) { entity.rotation = 0 }
    }
    static updateOffEdge(entity, dt) {
        const block = entity.offCorner

        if (block.movable) {
            entity.pos.x += block.pos.x - block.prevPosX
            entity.pos.y += block.pos.y - block.prevPosY
        }

        const entBounds = circBounds(entity)
        const blockBounds = rectBounds(block)
        const blockCornerX = blockBounds.x + (entity.offEdge === 1 ? blockBounds.width : 0)
        const normX = (blockCornerX - (entBounds.x + entBounds.radius)) / entBounds.radius
        const normY = (blockBounds.y - (entBounds.y + entBounds.radius)) / entBounds.radius
        const tanX = normY
        const tanY = -normX
        const a0 = atan(normY, normX) // angle of vector from circle's center to the block's corner

        if (entity.fricX) {
            entity.velX -= entity.fricX * entity.velX * dt / 2
        }
        const dPos = (entity.velX * tanX + 20 * tanY) * dt // dPos projection along tangent (this is the amount by which to move along circumference)
        const dA = dPos / entBounds.radius // rotation angle
        const a1 = a0 + dA // new angle
        
        // exit conditions
        switch (entity.offEdge) {
            case -1: // off left-edge
                const backOnTop = a1 > Math.PI / 2
                const readyToFall = a1 < offLeftThreshold
                const exiting = backOnTop || readyToFall
                if (exiting) {
                    entity.offEdge = 0
                    entity.velX *= 1.5
                }     
                if (readyToFall) {
                    entity.velX = -offEdgeToppleSpeed
                }
                if (backOnTop) {
                    entity.pos.y -= 0.5
                }
            break
            case 1: // off right-edge
                var cond1 = a1 < Math.PI / 2
                // console.log(a1 * 180 / Math.PI)
                if (cond1 || a1 > offRightThreshold) { // 2.35 is (90 + 45) degrees in radians
                    entity.offEdge = 0
                    !cond1 && (entity.velX = offEdgeToppleSpeed)
                    cond1 && (entity.velX *= 1.5)
                    return cond1 && (entity.pos.y -= 1 / 2)
                }
            break
        }
        const dx = entBounds.radius * (1 + Math.cos(a1)) // x-offset on circle which should now snap to the corner
        const dy = entBounds.radius * (1 + Math.sin(a1)) // y-offset on circle which should now snap to the corner
        
        const prevPosX = entity.pos.x
        setLocalPosX(entity, blockCornerX - dx)
        if (Math.abs(prevPosX - entity.pos.x) > 60) debugger
        setLocalPosY(entity, blockBounds.y - dy)

        entity.rotation += dA
    }
    static update(entity, dt) {
        if (entity.accX) {
            entity.velX += entity.accX * dt /  2
        }
        
        if (entity.accY) {
            entity.velY += entity.accY * dt / 2
        }
        
        if (entity.fricX) {
            entity.velX += - entity.fricX * entity.velX * dt / 2
        }
        
        if (entity.fricY) {
            entity.velY *= dt / entity.fricY
        }
        if (entity.roll) {
            entity.rotation += entity.velX * dt / (2 * entity.radius)
        }
        entity.pos.x += entity.velX * dt
        entity.pos.y += entity.velY * dt
    }
}