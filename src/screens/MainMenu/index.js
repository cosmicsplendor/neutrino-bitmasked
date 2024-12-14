import { Node } from "@lib"
import config from "@config"
import { calcAligned } from "@utils/entity"
import { LEVEL } from "@screens/names"
import Title from "./Title"
import initUI from "./initUI"
import { placeBg } from "../utils"
import mainmenuData from "../../assets/levels/mainmenu.cson"
import TiledLevel from "@lib/utils/TiledLevel"
import { TexRegion } from "@lib/index"
import { clamp } from "@lib/utils/math"
import moonImg from "@assets/images/background.png"
import atlasMeta from "@assets/images/atlasmeta.cson"
import BGen from "../../utils/BGen"


class MainMenuScreen extends Node {
    background="rgb(17, 34, 55)"
    constructor({ game, uiRoot, sdk }) {
        super()
        this.game = game
        this.uiRoot = uiRoot
        this.sdk = sdk
        game.assetsCache.once("load", () => {
            const { viewport } = config
            const data = game.assetsCache.get(mainmenuData)
            // data.fgTiles = data.fgTiles.reverse
            this.gameTitle = new Title()
            const graphic = new TiledLevel({ player: {}, data, scale: { x: 0.5, y: 0.5 }, factories: {
                default: (x, y, props) => {
                    return new TexRegion({ pos: { x, y }, frame: props.name })
                },
            } })
            game.renderer.tint = [ 0.01, -0.01, -0.005 ]
            this.graphic = graphic
            this.realign = vp => {
                const { devicePixelRatio } = config
                this.gameTitle.pos = { ...calcAligned({
                    x: 0, y:0, width: vp.width * devicePixelRatio, height: vp.height * devicePixelRatio
                }, { width: this.gameTitle.width, height: this.gameTitle.height }, "center", "top", 15, 80) }
                graphic.pos = { ...calcAligned({
                    x: 0, y:0, width: vp.width * devicePixelRatio, height: vp.height * devicePixelRatio
                }, { width: data.width / 2, height: data.height / 2 }, "center", "top", 15, 80) }
                graphic.pos.y = 210 // offset
            }
            viewport.on("change", this.realign)
            this.realign(viewport)

            this.bgen = new BGen(game.assetsCache.get(atlasMeta), 48, 80)
            this.teardownBg = placeBg(this, this.bgen.generateMinWidth(1920), [0.033203125,0.06640625,0.107421875], game.renderer.api)
            this.add(graphic)
            this.add(this.gameTitle)
            
            this.init()

        })
    }
    init() {
        const { graphic, gameTitle } = this;

        // Store initial positions
        this.initPositions = {
            graphic: { x: graphic.pos.x, y: graphic.pos.y },
            gameTitle: { x: gameTitle.pos.x, y: gameTitle.pos.y }
        };
        graphic.smooth = false
        graphic.gameTitle = false
        // Set up the necessary parameters
        this.frequency = 1.75;  // Adjust for speed of movement
        this.amplitude = 24;   // Amplitude of oscillation for gameTitle
        this.parallaxFactor = 0.4;  // How much slower graphic moves compared to gameTitle

        const minPhase = Math.PI * 0.05;
        const maxPhase = Math.PI * 0.9;
        const minY = Math.cos(minPhase) * this.amplitude;
        const maxY = Math.cos(maxPhase) * this.amplitude;
        this.yMin = Math.min(minY, maxY);
        this.yMax = Math.max(minY, maxY);

        const minX = Math.cos(minPhase) * this.amplitude;
        const maxX = Math.cos(maxPhase) * this.amplitude;
        this.xMin = Math.min(minX, maxX);
        this.xMax = Math.max(minX, maxX);

    }

    update(dt, t) {
        const { graphic, gameTitle, yMin, yMax, amplitude, frequency, parallaxFactor } = this;
        if (!graphic || !gameTitle) return

        const phase = t * frequency
        gameTitle.pos.y = this.initPositions.gameTitle.y + clamp(yMin * parallaxFactor * amplitude, yMax/parallaxFactor, Math.cos(phase) * amplitude);
        graphic.pos.y = this.initPositions.graphic.y + clamp(yMin * amplitude, yMax * amplitude, Math.cos(phase) * amplitude * parallaxFactor);
        this.container.children.forEach(child => {
            if (child.update) {
                child.update(dt)
            }
        })
    }
    onEnter() {
        const { uiRoot, game, sdk } = this
        this.teardownUI = initUI({ uiRoot, onPlay: () => {
            // on play button click
            const proceed = () => game.switchScreen(LEVEL, true)
            uiRoot.clear()
            if (!config.prerollAd) {
                return proceed()
            }
            sdk.prerollAd()
                .then(proceed)
                .catch(proceed)
        }})
        game.renderer.changeBackground(this.background, moonImg)
        this.game.renderer.canvas.style.backgroundPosition = "40% 25%"
        this.game.renderer.canvas.style.backgroundOpacity = 1
    }
    onExit() {
        this.teardownUI()
        config.viewport.off("change", this.realign)
        // // if (typeof this.teardownBg === "function") this.teardownBg()
        this.game.assetsCache.unload(mainmenuData)
        this.game.disposeScreen(this)
    }
}

export default MainMenuScreen