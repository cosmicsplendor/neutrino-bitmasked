import Game from "@utils/Game"
import UI from "@utils/UI"
import createRenderer from "@lib/renderer/create"
import AssetsCache from "@utils/AssetsCache"
import TexRegion from "@lib/entities/TexRegion"
import Storage from "./helpers/Storage"
import SDK from "./helpers/SDK"
import testLevelData from "./assets/levels/testlevel.cson"
import mainmenuData from "./assets/levels/mainmenu.cson"

import config from "@config"
import levels from "./screens/Level/levels"
import * as screenNames from "@screens/names"
import LoadingScreen from "@screens/Loading"
import MainMenuScreen from "@screens/MainMenu"
import GameScreen from "@screens/Game"
import LevelScreen from "@screens/Level"

import soundSprite from "@assets/audio/sprite.mp3"
import soundMeta from "@assets/audio/sprite.cson"
import texatlasId from "@assets/images/texatlas.png"
import atlasmetaId from "@assets/images/atlasmeta.cson"
import bgDataId from "@assets/levels/background.cson"
import particlesId from "@assets/particles/all.cson"
import arrowImgId from "@assets/images/ui/arrow.png"
import crossImgId from "@assets/images/ui/cross.png"
import orbImgId from "@assets/images/ui/orb.png"
import pauseImgId from "@assets/images/ui/pause.png"
import resetImgId from "@assets/images/ui/reset.png"
import resumeImgId from "@assets/images/ui/resume.png"
import soundOnImgId from "@assets/images/ui/sound_on.png"
import soundOffImgId from "@assets/images/ui/sound_off.png"
import rvaImgId from "@assets/images/ui/rva.png" // rewarded video add icon
const { viewport } = config
const renderer = createRenderer({ cnvQry: "#arena", scene: null, background: "#000000", viewport }) // scene will be injected by game
const assetsCache = new AssetsCache()
const storageStrat = new config.StorageStrat(config.storageId)
const storage = new Storage(storageStrat)
const uiRoot = UI.query("#ui-layer")
const curLevel = storage.getCurLevel()
const assets = [
    { url: particlesId, msg: "loading particles" },
    crossImgId,
    orbImgId,
    pauseImgId,
    resetImgId,
    resumeImgId,
    soundOnImgId,
    soundOffImgId,
    rvaImgId,
    mainmenuData,
    { url: arrowImgId, msg: "loading ui assets" },
    { url: soundSprite, msg: "loading audio sprite" },
    { url: soundMeta, msg: "loading audio sprite metadata"},
    { url: texatlasId, msg: "loading images" },
    { url: atlasmetaId, msg: "loading texture atlas" },
]

if (config.testMode) {
    assets.push(testLevelData)
}

try {
    assets.push({ url: levels[curLevel - 1], msg: "loading level data" }) // pre-load the current level
} catch(e) { console.log(e.message)}

assets.push(bgDataId)

const sdkStrat = !!config.SDKStrat ? new config.SDKStrat(): false
const sdk = new SDK(sdkStrat)
const screenFactories = {
    [screenNames.LOADING]: game => new LoadingScreen({ game, uiRoot, assets, sdk }),
    [screenNames.MAIN_MENU]: game => new MainMenuScreen({ game, uiRoot, sdk }),
    [screenNames.GAME]: game => new GameScreen({ game, uiRoot, storage, sdk }),
    [screenNames.LEVEL]: game => new LevelScreen({ game, uiRoot, storage }),
}
const game = new Game({
    renderer,
    assetsCache,
    storage,
    screenFactories,
})

sdk.setOnPause(() => game.pause())
sdk.setOnResume(() => game.resume())

if (!storage.getSound()) {
    game.turnOffSound()
}

assetsCache.once("prog-end", () =>  { // listening to "progress-end" instead of "load" to ensure critical engine setup tasks happen before emission of load event
    const atlasmeta = assetsCache.get(atlasmetaId)
    const texatlas = assetsCache.get(texatlasId)
    // texatlas.setAttribute("crossorigin", "anonymous")
    renderer.setTexatlas(
        texatlas,
        atlasmeta
    )
    TexRegion.injectAtlasmeta(atlasmeta)
})
game.switchScreen(screenNames.LOADING)
game.start()