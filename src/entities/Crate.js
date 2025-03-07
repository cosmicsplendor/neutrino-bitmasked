import { TexRegion, Node } from "@lib"
import { objLayerId, fgLayerId } from "@lib/constants"
import { clamp } from "@utils/math"
import Timer from "@utils/Timer"

const initFrame = "lcr1"
const dmgToFrame = [
    "lcr2",
    "lcr3"
]
class Crate extends TexRegion { // breakable crate class
    noOverlay=true
    constructor(x, y, dmgFacs, orbPool, sounds, luck=75, dmg=0, temp=false, player) {
        super({ frame: initFrame, pos: { x, y }})
        this.dmgFacs = dmgFacs
        this.orbPool = orbPool
        this.player = player
        this.sounds = sounds
        this.luck = luck
        this.temp = temp
        this.setDamage(dmg)
        this.reset = () => {
            this.alpha = 1
            this.setDamage(dmg)
        }
    }
    setDamage(dmg) {
        this.damage = clamp(0, dmgToFrame.length, dmg)
        if (this.damage > 0) {
            return  this.frame = dmgToFrame[this.damage - 1]
        } 
        this.frame = initFrame
    }
    takeDamage(vy) {
        if (Math.abs(vy) < 300) { return }
        
        this.damage++
        this.sounds.crack.play()
        if (this.damage > dmgToFrame.length) {
            this.break(vy)
            return
        }
        this.frame = dmgToFrame[this.damage - 1]
    }
    break(vy) {
        if (this.temp) {
            this.remove()
        } else {
            this.alpha = 0
        }
        const dir = vy > 0 ? "down": "up" 
        const particle = this.dmgFacs[dir].create()
        particle.pos.x = this.pos.x
        particle.pos.y = this.pos.y
        this.sounds.snap.play()
        if (Math.random() < this.luck / 100) { // chance of spawning is determined by luck factor
            const orb = this.orbPool.create(this.pos.x - 6 + this.width / 2, this.pos.y -6 + this.height / 2, null,  this.player )
            orb.active = false
            orb.add(new Timer(0.6, null, () => {
                orb.active = true
            }))
            Node.get(fgLayerId).add(orb)
        }
        Node.get(objLayerId).add(particle)
    }
}

export default Crate