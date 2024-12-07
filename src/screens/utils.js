import { Node } from "@lib"
import config from "@config"
import atlasmetaId from "@assets/images/atlasmeta.cson"
import TexRegion from "@lib/entities/TexRegion"
import bgDataId from "@assets/levels/background.cson"

export const placeBg = (screen, assetsCache, overlay=[0.03529411764705882, 0.03529411764705882, 0.03529411764705882], rendererAPI) => {
    if (rendererAPI !== "webgl") return
    const bgData = assetsCache.get(bgDataId)
    screen.container = new Node()
    screen.add(screen.container)
    bgData.forEach(tile => {
        screen.container.add(new TexRegion({ frame: tile.name, pos: { x: tile.x, y: tile.y }}))
    })
    const atlasMeta = assetsCache.get(atlasmetaId)
    const y1 = bgData.reduce((min, tile) => Math.min(min, tile.y), Infinity)
    const y2 = bgData.reduce((max, tile) => Math.max(max, tile.y + atlasMeta[tile.name].height), 0)
    const height = y2 - y1
    screen.container.overlay = overlay
    const realignBg = () => {
        if (screen.container) screen.container.pos.y = -y1 + (config.viewport.height * config.devicePixelRatio - height)
    }
    realignBg()
    config.viewport.on("change", realignBg)
    
    return function teardownBg() {
        screen.children.length = 0
        screen.container = null
        config.viewport.off("change", realignBg)
    }
}