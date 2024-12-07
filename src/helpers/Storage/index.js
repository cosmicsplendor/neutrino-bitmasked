import Observable from "@lib/utils/Observable"

const castToNum = (val, errParam) => {
    const num = Number(val)
    if (num !== 0 && !num) {
        throw new Error(`Attempting to set invalid ${errParam}: ${val}`)
    }
    return num
}

class Storage extends Observable {
    constructor(strat) {
        super([ "orb-update", "music-update", "sound-update" ])
        this.strat = strat
        const txtData = strat.get()
        this.data = !!txtData ? JSON.parse(txtData): { 
            curLevel: 1,
            orbCount: 6,
            hiscores: {},
            music: true,
            sound: true
        }
    }
    setNum(key, val) {
        const num = castToNum(val, key)
        this.data[key] = num
        this.save(this.data)
        return num
    }
    setCurLevel(val) {
        this.setNum("curLevel", val)
    }
    setOrbCount(val) {
        const num = this.setNum("orbCount", val)
        this.emit("orb-update", num)
    }
    setHiscore(level, val) {
        const time  = castToNum(val, "hiscore")
        this.data.hiscores[String(level)] = time
        this.save(this.data)
    }
    getCurLevel() {
        return this.data.curLevel
    }
    getOrbCount() {
        return this.data.orbCount
    }
    getHiscore(level) {
        return this.data.hiscores[String(level)]
    }
    getMusic() {
        return this.data.music
    }
    setMusic(val) {
        this.data.music = val
        this.emit("music-update", this.data.music)
        this.save(this.data)
    }
    getSound() {
        return this.data.sound
    }
    setSound(val) {
        this.data.sound = val
        this.emit("sound-update", this.data.sound)
        this.save(this.data)
    }
    save(data) {
        this.strat.set(JSON.stringify(data))
    }
}

export default Storage