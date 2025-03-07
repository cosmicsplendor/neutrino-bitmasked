import Viewport  from "@utils/ViewPort"
import levels from "../screens/Level/levels"

/**
 * config checklist:
 * 1. resolution
 * 2. storage strategy class
 * 3. sdk strategy class (null for none)
 */

const resolutions = {
    standard: { max: 1280, min: 720 },
    r1080p: { max: 1920, min: 1080 },
    full: { max: 1360, min: 1080 },
    hd: { max: 1440, min: 986 },
    r720p: { max: 1280, min: 720 },
    custom: { max: 1280, min: 1080 }
}

const desktopRes = resolutions.standard

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
const scale = false
const maxMobileDpr = 2


export default overrides => {
    const testMode = overrides.testMode
    const computeViewport = () => {
        const width = window.innerWidth, height = window.innerHeight // drawing buffer dimensions (how manny actual pixels are there in the screen regardless of scaling) / devicePixelRatio
        const portraitMode = height > width
        if (isMobile) {
            /**
             * 100% of the smaller side
             * and max(100% of the smaller side, 70% of the bigger side)
             */
            const vpWidth = portraitMode ? width: Math.max(width, height)
            const vpHeight = portraitMode ? Math.max(height, width): height
            return ({
                width: vpWidth,
                height: vpHeight
            })
        }
        if (testMode) {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            }
        }
        const maxWidth = portraitMode ? desktopRes.min: desktopRes.max
        const maxHeight = portraitMode ? desktopRes.max: desktopRes.min
        const vpWidth = Math.min(width, maxWidth)
        const vpHeight = Math.min(height, maxHeight)
        return ({ // canvas dimensions
            width: vpWidth,
            height: vpHeight,
        })
        
    }
    const defaultConfig = {
        levels: levels.length,
        viewport: new Viewport(computeViewport),
        storageId: "lasdhf0qw",
        worldWidth: 1000,
        worldHeight: window.innerHeight,
        gravity: 1700,
        isMobile,
        scale,
        get devicePixelRatio() {
            if (this.testMode) return 1
            return isMobile ? Math.min(maxMobileDpr, window.devicePixelRatio): window.devicePixelRatio
        },
        orientation: "portrait",
    }
    return Object.assign(defaultConfig, overrides)
}