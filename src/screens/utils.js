import { Node } from "@lib"
import config from "@config"
import TexRegion from "@lib/entities/TexRegion"

export const placeBg = (screen, bgData, overlay=[0.03529411764705882, 0.03529411764705882, 0.03529411764705882], rendererAPI) => {
    if (rendererAPI !== "webgl") return
    screen.container = new Node()
    screen.add(screen.container)
    bgData.forEach(tile => {
        const tex = new TexRegion({ frame: tile.t, pos: { x: tile.x, y: config.viewport.height  + tile.y }})
        if (tile.flip) {
            tex.scale = { x: -1, y: 1 }
        }
        tex.y0 = tile.y
        screen.container.add(tex)
    })
    screen.container.overlay = overlay
    const realignBg = () => {
        screen.container.children.forEach(child => {
            child.pos.y = config.viewport.height * config.devicePixelRatio - tile.y0
        })
    }
    config.viewport.on("change", realignBg)
    
    return function teardownBg() {
        screen.children.length = 0
        screen.container = null
        config.viewport.off("change", realignBg)
    }
}