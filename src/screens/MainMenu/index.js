import { Node } from "@lib"
import config from "@config"
import { calcAligned } from "@utils/entity"
import { LEVEL } from "@screens/names"
import Ball from "./Ball"
import initUI from "./initUI"
import { placeBg } from "../utils"
import mainmenuData from "../../assets/levels/mainmenu.cson"
import { clamp } from "@lib/utils/math"
import moonImg from "@assets/images/background.png"
import atlasMeta from "@assets/images/atlasmeta.cson"
import BGen from "../../utils/BGen"


class MainMenuScreen extends Node {
    background="rgb(11 45 82)"
    constructor({ game, uiRoot, sdk }) {
        super()
        this.game = game
        this.uiRoot = uiRoot
        this.sdk = sdk
        game.assetsCache.once("load", () => {
            const { viewport } = config
            this.ball = new Ball()
            game.renderer.tint = [ 0.01, -0.01, -0.005 ]
            this.realign = vp => {
                const { devicePixelRatio } = config
                this.ball.pos = { ...calcAligned({
                    x: 0, y:0, width: vp.width * devicePixelRatio, height: vp.height * devicePixelRatio
                }, { width: this.ball.width, height: this.ball.height }, "center", "center", 0, -32) }
            }
            viewport.on("change", this.realign)
            this.realign(viewport)

            this.bgen = new BGen(game.assetsCache.get(atlasMeta), 48, 80)
            this.bgen.reset("Japan")
            this.bgEntities = this.bgen.generateMinWidth(1920)
            this.teardownBg = placeBg(this, this.bgEntities, [0.033203125,0.06640625,0.107421875], game.renderer.api)
            this.add(this.ball)
        })
    }
    update(dt, t) {
        if (!this.ball) return
        this.ball.update(dt, t)
    }
    onEnter() {
        const { uiRoot, game, sdk } = this
        this.teardownUI = initUI({ uiRoot, onPlay: () => {
            // on play button click
            const proceed = () => game.switchScreen(LEVEL, this.bgEntities)
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