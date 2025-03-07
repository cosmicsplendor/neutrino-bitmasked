import Node from "@lib/entities/Node"
import { webAudioSupported } from "@utils/Sound"
import ParallaxCamera from "@lib/entities/ParallaxCamera"
import SoundSprite from "@utils/Sound/SoundSprite"
import ParticleEmitter from "@lib/utils/ParticleEmitter"
import State from "./State"
import initUI from "./initUI"
import { LEVEL } from "../names"
import * as rendApis from "@lib/renderer/apis"
import moonImg from "@assets/images/background.png"
import config from "@config"
import Level from "./Level"
import makeFactories from "./makeFactories"
import Player from "@entities/Player"
import soundSpriteId from "@assets/audio/sprite.mp3"
import soundMetaId from "@assets/audio/sprite.cson"
import particlesUrl from "@assets/particles/all.cson"
import atlasMeta from "@assets/images/atlasmeta.cson"
import testlevel from "@assets/levels/testlevel.cson"

import resumeImgId from "@assets/images/ui/resume.png"
import pauseImgId from "@assets/images/ui/pause.png"
import crossImgId from "@assets/images/ui/cross.png"
import resetImgId from "@assets/images/ui/reset.png"
import orbImgId from "@assets/images/ui/orb.png"
import soundOnImgId from "@assets/images/ui/sound_on.png"
import soundOffImgId from "@assets/images/ui/sound_off.png"
import rvaImgId from "@assets/images/ui/rva.png" // rewarded video add icon
import { hexToNorm } from "@lib/utils/math"
import Checkpoint from "./Checkpoint"
import Ambience from "./Ambience"
import ambience1Graph from "./Ambience/graphs/ambience1"
import ambience2Graph from "./Ambience/graphs/ambience2"
import ambience3Graph from "./Ambience/graphs/ambience3"
import ambience4Graph from "./Ambience/graphs/ambience4"
import ambience5Graph from "./Ambience/graphs/ambience5"
import overlayMap from "./overlayMap.json"
import BGen from "../../utils/BGen"
import Rain from "../../entities/Rain"

class GameScreen extends Node { // can only have cameras as children
    // background = "rgb(181 24 24)"
    initialized = false
    soundPools = ["gate"]
    constructor({ game, uiRoot, storage, sdk }) {
        super()
        this.storage = storage
        this.sdk = sdk
        this.game = game
        this.uiRoot = uiRoot
    }
    setThingsUp(levelData) {
        const { storage, game } = this
        const { assetsCache } = game

        this.state = new State()
        this.state.on("pause", () => {
            game.pause()
        })
        this.state.on("play", () => {
            game.resume()
        })
        storage.on("sound-update", state => {
            state ? game.turnOnSound() : game.turnOffSound()
        })

        const soundSprite = new SoundSprite({
            resource: assetsCache.get(soundSpriteId),
            resourceId: soundSpriteId,
            meta: assetsCache.get(soundMetaId)
        })
        const particles = assetsCache.get(particlesUrl)
        const shard = new ParticleEmitter(particles.shard)
        const cinder = new ParticleEmitter(particles.cinder)
        cinder.noOverlay = true
        const playerSounds = Player.sounds.reduce((spritemap, frame) => {
            spritemap[frame] = soundSprite.create(frame)
            return spritemap
        }, {})

        shard.onRemove = () => {
            shard.parent = null
        }
        cinder.onRemove = () => {
            cinder.parent = null
        }

        this.soundSprite = soundSprite
        this.btnSound = soundSprite.create("btn")
        this.errSound = soundSprite.createPool("err_alt")
        this.contSound = soundSprite.create("continue")
        this.soundMap = {
            "flute_amb_1": soundSprite.create("flute_amb_1"),
            "flute_amb_2": soundSprite.create("flute_amb_2"),
            "g_solo_1": soundSprite.create("g_solo_1"),
            "g_solo_2": soundSprite.create("g_solo_2"),
            "g_solo_3": soundSprite.create("g_solo_3"),
            "jingl_1": soundSprite.create("jingl_1"),
            "mel1": soundSprite.create("mel1"),
            "mel2": soundSprite.create("mel2"),
            "mel3": soundSprite.create("mel3"),
            "mel4": soundSprite.create("mel4"),
            "wind_1": soundSprite.create("wind_1"),
            "wind_2": soundSprite.create("wind_2"),
            "wind_3": soundSprite.create("wind_3"),
            "creepy": soundSprite.create("creepy")
        }
        this.ambiences = {
            ambience1: new Ambience(ambience1Graph, this.soundMap),
            ambience2: new Ambience(ambience2Graph, this.soundMap),
            ambience3: new Ambience(ambience3Graph, this.soundMap),
            ambience4: new Ambience(ambience4Graph, this.soundMap),
            ambience5: new Ambience(ambience5Graph, this.soundMap),
        }
        this.player = new Player({ width: 64, height: 64, fill: "brown", speed: 350, fricX: 3, pos: { x: 0, y: 0 }, shard, cinder, sounds: playerSounds, state: this.state })
        this.factories = makeFactories({ soundSprite, assetsCache, storage, player: this.player, state: this.state })
        if (game.renderer.api === rendApis.WEBGL) {
            const z = 2.5
            const location = levelData.location || "Egypt"
            const bgen = new BGen(this.game.assetsCache.get(atlasMeta), 48, 80)
            bgen.reset(location)
            const tiles = bgen.generateMinWidth(1920 + ((Math.max(levelData.width - 1920, 0)) / z))
            this.bg = new ParallaxCamera({ z, zAtop: 1, viewport: config.viewport, worldBaseline: levelData.height, subject: this.player, instF: false, entYOffset: 0, tiles }) // parallax bg
            this.add(this.bg)
           
        }
        this.uiImages = {
            cross: assetsCache.get(crossImgId),
            resume: assetsCache.get(resumeImgId),
            pause: assetsCache.get(pauseImgId),
            orb: assetsCache.get(orbImgId),
            reset: assetsCache.get(resetImgId),
            soundOn: assetsCache.get(soundOnImgId),
            soundOff: assetsCache.get(soundOffImgId),
            rva: assetsCache.get(rvaImgId)
        }
    }
    setLevel(data) {
        const level = new Level({ player: this.player, data, viewport: config.viewport, subject: this.player, factories: this.factories, ambience: this.ambiences[data.ambience], gameState: this.state, overlayMap })
        if (data.rain) {
            this.add(new Rain(level))
        }
        this.add(level)
        this.player.mxJmpVel = data.mxJmpVel
        this.player.speed = data.speed ?? 350
        this.game.renderer.changeBackground(config.isMobile || this.game.renderer.api === rendApis.CNV_2D ? data.mob_bg : data.bg, moonImg)
        this.game.renderer.canvas.style.backgroundPosition = data.bgPos ?? "-50%"
        this.game.renderer.tint = data.tint && data.tint.split(",").slice(0, 3)

        level.parent = null // sever the child to parent link (necessary for correct collision detection when camera isn't the root node)
        if (this.bg) {
            this.bg.overlay = data.pxbg && hexToNorm(data.pxbg)
            this.bg.layoutTiles(level.world)
        }
        return level
    }
    unsetLevel() {
        if (this.children) {
            // const lastIdx = this.children.length - 1
            // lastIdx > -1 && Node.removeChild(this, this.children[lastIdx])
            this.children.forEach(child => {
                Node.removeChild(this, child, true)
            })
            this.children.length = 0
        }
    }
    onEnter(l, levelDataId) {
        const data = this.game.assetsCache.get(config.testMode ? testlevel : levelDataId)
        this.setThingsUp(data)
        const level = this.setLevel(data)
        const onClose = advance => this.game.switchScreen(LEVEL, false, advance)
        const checkpoint = new Checkpoint(data.checkpoints)
        this.checkpoint = checkpoint
        const focusInst = () => {
            level.focusInst()
            this.bg && this.bg.focusInst()
        }
        const resetLevel = () => {
            window.Node = Node
            window.level = level
            level.resetRecursively()
            checkpoint.reset()
        }

        focusInst()
        level.idx = l - 1
        const getCheckpoint = checkpoint.get.bind(checkpoint)
        const { teardownUI, updateTimer } = initUI(this.uiRoot, this.player, this.uiImages, this.storage, this.state, onClose, resetLevel, focusInst, getCheckpoint, this.btnSound, this.errSound, this.contSound, webAudioSupported, this.game, this.sdk)
        this.state.level = l
        this.teardownUI = teardownUI
        this.updateTimer = updateTimer
        this.state.play()
    }
    onExit() {
        this.unsetLevel()
        this.game.reset()
        this.teardownUI && this.teardownUI()
        this.children && (this.children.length = 0)
        this.game.disposeScreen(this)
    }
    update(dt, t) {
        this.checkpoint.updateX(this.player.pos.x)
        this.state.elapsed += dt
        this.children.forEach(child => {
            Node.updateRecursively(child, dt, t, child) // out-of-view culling on a per-camera basis
        })
        if (!config.testMode) this.updateTimer(this.state.elapsed)
    }
}

export default GameScreen