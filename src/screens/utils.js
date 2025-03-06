import { Node } from "@lib"
import config from "@config"

export const placeBg = (screen, bgEntities, overlay=[0.03529411764705882, 0.03529411764705882, 0.03529411764705882], rendererAPI) => {
    if (rendererAPI !== "webgl") return
    screen.container = new Node()
    screen.add(screen.container)
    bgEntities.forEach(entity => {
        screen.container.add(entity)
    })
    screen.container.overlay = overlay
    const realignBg = () => {
        screen.container.children.forEach(child => {
            child.pos.y = (config.viewport.height * config.devicePixelRatio + child.y0)
        })
    }
    realignBg()
    config.viewport.on("change", realignBg)
    
    return function teardownBg() {
        screen.children.length = 0
        screen.container = null
        config.viewport.off("change", realignBg)
    }
}