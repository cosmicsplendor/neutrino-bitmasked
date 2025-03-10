import ParticleEmitter from "@lib/utils/ParticleEmitter"
import Orb from "@entities/Orb"
import Gate from "@entities/Gate"
import Wind from "@entities/Wind"
import Magnet from "@entities/Magnet"
import FloorSpike from "@entities/FloorSpike"
import Ball from "@entities/Ball"
import SawBlade from "@entities/SawBlade"
import Laser from "@entities/Laser"
import Fire from "@entities/Fire"
import Monster from "@entities/Monster"
import Crate from "@entities/Crate"
import Pool from "@utils/Pool"
import Bus from "@entities/Bus"
import LeverSaw from "../../entities/LeverSaw"
import Vent from "../../entities/Vent"
import Cobweb from "../../entities/Cobweb"
import Hearth from "../../entities/Hearth"
import Lantern from "../../entities/Lantern"
import config from "@config"

import particlesId from "@assets/particles/all.cson"
import { TexRegion } from "@lib/index"

export default ({ soundSprite, assetsCache, storage, player, state }) => { // using sound sprite to create and pass objects and (cached) pools so that objects can just consume sound in ready-to-use form rather than by creating them on their own. This helps me make sound creation parameters changes at one place, making code more scalable.
    const gateUSound = soundSprite.create("gate_u") // collision with ceiling
    const gateDSound = soundSprite.create("gate_d")
    const orbSound = soundSprite.createPool("orb")
    const endSound = soundSprite.create("end")
    const spikeSound = soundSprite.createPool("spike", { size: 2 })
    const emberSound = soundSprite.createPool("scatter", { size: 3 })
    const lasSounds = {
        on: soundSprite.createPool("las_on"),
        off: soundSprite.createPool("las_off")
    }
    
    const particles = assetsCache.get(particlesId)
    const createOrbPool = (temp, size, orbSound, storage) => {
        const orbFac = (x, y, props, player) => { // factory for creating orbs at orb spawn points in the map
            return new Orb(Object.assign(
                { },
                particles.orb,
                { player, pos: { x, y }, sound: orbSound, storage, temp },
            ))
        }
        const orbPool = new Pool({
            factory: orbFac,
            size,
            free(obj) {
                obj.chasing = false
                obj.remove() // remove the object from it's parent
            },
            reset(obj, x, y) {
                obj.chasing = false
                obj.pos.x = x
                obj.pos.y = y
            }
        })
        return orbPool
    }
    const orbPool = createOrbPool(false, 12, orbSound, storage)
    const tempOrbPool = createOrbPool(true, 6, orbSound, storage)
    const windPool = new Pool({
        factory: (x, y, props, player) => {
            return new Wind(
                particles.wind,
                x, y, player
            )
        },
        size: 3,
        free(obj) {
            obj.remove()
        },
        reset(obj, x, y) {
            obj.pos.x = x
            obj.pos.y = y - 10
        },
    })

    const onFireTouch = () => {
        const bestTime = storage.getHiscore(state.level) || 0
        const curTime = state.elapsed
        if (state.level === storage.getCurLevel() && state.level < config.levels) {
            storage.setCurLevel(state.level + 1)
        }
        if (bestTime === 0 || curTime < bestTime) {
            storage.setHiscore(state.level, curTime)
        }
        endSound.play()
        state.complete(curTime, bestTime)
    }
    const crateDmgFacs = Object.freeze({
        up: new Pool({
            factory: () => {
                const particle = new ParticleEmitter(particles.crateUp)
                particle.noOverlay=true
                particle.onRemove = () => { // clear reference for garbage collector
                    particle.parent = null
                }
                return particle
            },
            size: 2
        }),
        down: new Pool({
            factory: () => {
                const particle = new ParticleEmitter(particles.crateDown)
                particle.noOverlay=true
                particle.onRemove = () => { // clear reference for garbage collector
                    particle.parent = null
                }
                return particle
            },
            size: 2
        }),
    })
    const wSounds = { // wood sounds
        snap: soundSprite.createPool("w_snap"),
        crack: soundSprite.createPool("w_crack")
    }
    const playerFac = (x, y, props) => {
        player.reset = () => {
            player.pos.x = x
            player.pos.y = y
            player.alpha = 1
            player.velY = player.velX = 0
            player.controls.switchState("jumping", player, true) // revert to jumping state
        }
        player.rotation = props.slide === true ? NaN: 0
        player.reset()
        return player
    }
    return ({
        player: playerFac,
        gate: (x, y, props, player) => {
            return new Gate({
                pos: { x, y },
                colSound: null,
                uSound: gateUSound,
                dSound: gateDSound,
                player,
                ...props
            })
        },
        leverSaw: (x, y, props, player)  => {
            return new LeverSaw({x, y, length: props.length, period: props.period, path: props.path, player})
        },
        vent: (x, y)  => {
            return new Vent(x, y)
        },
        cobweb: (x, y) => {
            return new Cobweb(x, y)
        },
        lantern: (x, y) => {
            return new Lantern(x, y)
        },
        hearth: (x, y, props, player) => {
            return new Hearth({ x, y, dir: props.dir, player, sound: emberSound })
        },
        monster: (x, y, props={}, player) => {
            return new Monster({x, y, player, span: props.span, orbPool: tempOrbPool })
        },
        floorSpike: (x, y, props, player) => {
            const fs = new FloorSpike({
                pos: { x, y },
                player,
                uSound: spikeSound,
                dSound: spikeSound,
                ...props
            })
            return fs
        },
        orb: orbPool.create.bind(orbPool),
        wind: windPool.create.bind(windPool),
        fire: (x, y, _, player) => {
            const fire = new Fire(particles.fire, onFireTouch)
            fire.player = player
            fire.pos.x = x
            fire.pos.y = y
            return fire
        },
        magnet: (x, y) => {
            return new Magnet({ pos: { x, y }, frame: "magnet" })
        },
        ball: (x, y, props, player) => {
            return new Ball(x, y, props.seq, player)
        },
        sb1: (x, y, props, player) => {
            return new SawBlade(x, y,  "sb1", props.toX, props.toY, props.speed, player)
        },
        sb2: (x, y, props, player) => {
            return new SawBlade(x, y,  "sb2", props.toX, props.toY, props.speed, player)
        },
        sb3: (x, y, props, player) => {
            return new SawBlade(x, y,  "sb3", props.toX, props.toY, props.speed, player)
        },
        sb4: (x, y, props, player) => {
            return new SawBlade(x, y,  "sb4", props.toX, props.toY, props.speed, player)
        },
        sb5: (x, y, props, player) => {
            return new SawBlade(x, y,  "sb5", props.toX, props.toY, props.speed, player)
        },
        sb6: (x, y, props, player) => {
            return new SawBlade(x, y,  "sb6", props.toX, props.toY, props.speed, player)
        },
        lcr1: (x, y, props, player) => {
            return new Crate(x, y, crateDmgFacs, tempOrbPool, wSounds, props.luck, props.dmg, props.temp, player)
        },
        vlhd: (x, y, props, player) => {
            return new Laser(x, y, props.toX, props.toY, props.speed, props.num, true, props.period, props.delay, props.on, player, lasSounds)
        },
        hlhd: (x, y, props, player) => {
            return new Laser(x, y, props.toX, props.toY, props.speed, props.num, false, props.period,props.delay, props.on, player, lasSounds)
        },
        bus: (x, y, props, player) => {
            return new Bus({x, y, player, ...props})
        },
        default: (x, y, props) => {
            return new TexRegion({ pos: { x, y }, frame: props.name })
        }
    })
}