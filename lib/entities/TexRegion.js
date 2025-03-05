import Node from "./Node"
import { texregion } from "./types"

class TexRegion extends Node {
    static _assetsCache = null
    static injectAtlasmeta(val) {
        this._meta = val
    }
    static syncFrame(txtr, frame) {
        const meta = this._meta[frame]
        if (!!meta.hitbox) {
            txtr.hitbox = meta.hitbox
        }
        txtr.hitCirc = meta.hitCirc ?? undefined
        txtr.initialRotation = meta.rotation ? -meta.rotation * Math.PI / 180 : null
        txtr.width = meta.width
        txtr.height = meta.height
        txtr.w = txtr.initialRotation ? txtr.height : txtr.width // width on the atlas
        txtr.h = txtr.initialRotation ? txtr.width : txtr.height // height on the atlas
        txtr.frame = frame
        if (txtr.initialRotation) {
            txtr.initialPivotX = -txtr.height
        }
    }
    constructor({ frame, overlay, ...nodeProps }) {
        super({ ...nodeProps })
        if (overlay) {
            if (overlay === "none") {
                this.noOverlay = true
            } else {
                this.overlay = overlay
            }
        }
        this.type = texregion
        TexRegion.syncFrame(this, frame)
    }
    setAnchor(val) {
        this.anchor = this.initialRotation ? { x: val.y, y: val.x } : val
    }
}

// export const createAtlas = ({ metaId, imgId }) => ({
//     createRegion: (params={}) => new TexRegion({ metaId, imgId, ...params })
// })

export default TexRegion