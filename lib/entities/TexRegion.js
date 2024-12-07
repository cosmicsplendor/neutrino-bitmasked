import Node from "./Node"
import { texregion } from "./types"

class TexRegion extends Node {
    static _assetsCache = null
    static injectAtlasmeta(val) {
        this._meta = val
    }
    constructor({ frame, overlay, isCustom=false, ...nodeProps }) {
        super({ ...nodeProps })
        const meta = TexRegion._meta[frame]
        if (!!meta.hitbox) {
            this.hitbox = meta.hitbox
        }
        if (overlay) {
            if (overlay === "none") {
                this.noOverlay = true
            } else {
                this.overlay = overlay
            }
        }
        this.hitCirc = meta.hitCirc ?? undefined
        this.type = texregion
        this.initialRotation = meta.rotation ? -meta.rotation * Math.PI / 180 : null
        this.width =  meta.width
        this.height = meta.height
        this.w = this.initialRotation ? this.height: this.width // width on the atlas
        this.h = this.initialRotation ? this.width: this.height // height on the atlas
        this.frame = isCustom ? [ meta.x, meta.y, this.w, this.h ]: frame
        if (this.initialRotation) { 
            this.initialPivotX = -this.height 
        }
    }
    setAnchor(val) {
        this.anchor = this.initialRotation ? { x: val.y, y: val.x }: val
    }
}

// export const createAtlas = ({ metaId, imgId }) => ({
//     createRegion: (params={}) => new TexRegion({ metaId, imgId, ...params })
// })

export default TexRegion