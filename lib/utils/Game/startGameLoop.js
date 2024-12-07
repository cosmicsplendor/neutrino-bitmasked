import { Node } from "@lib"
const startGameLoop = ({ mainUpdateFn = () => { }, renderer, step = 100 }) => {
    const STEP = step // max frame duration
    const RENDER_FPS = 55, UPDATE_FPS = 60
    const [RENDER_INTERVAL, UPDATE_INTERVAL] = [RENDER_FPS, UPDATE_FPS].map(fps => 1000 / fps)
    const UPDATE_INTERVAL_SECS = UPDATE_INTERVAL / 1000
    let lastUpdated = 0, lastRendered = 0
    let speed = 1
    let paused = false

    function loop(ts) {
        // const dt = speed * Math.min(ts - lastUpdated, STEP) / 1000
        let dt = speed * Math.min(ts - lastUpdated, STEP)
        const dtRen = ts - lastRendered
        const tsInSecs = ts / 1000
        
        if (paused) return requestAnimationFrame(loop)

        // if root scene has update method that's where recursive update should go (it is useful when we have multiple cameras, one for each parallax layer)
        while (dt >= UPDATE_INTERVAL) {
            renderer.scene.update ? renderer.scene.update(UPDATE_INTERVAL_SECS, tsInSecs) : Node.updateRecursively(renderer.scene, UPDATE_INTERVAL_SECS, tsInSecs, renderer.scene)
            mainUpdateFn(UPDATE_INTERVAL_SECS, tsInSecs)
            dt -= UPDATE_INTERVAL
        }

        if (dtRen >= RENDER_INTERVAL) {
            renderer.renderRecursively()
            lastRendered = ts - (dtRen - RENDER_INTERVAL)
        } else {
            lastRendered = ts - dtRen
        }
        
        lastUpdated = ts - dt
        requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
    return {
        pause() {
            paused = true
        },
        resume() {
            paused = false
        },
        setSpeed(val) { speed = val },
        get meta() {
            return {
                elapsed: lastUpdated / 1000
            }
        }
    }
}

export default startGameLoop

