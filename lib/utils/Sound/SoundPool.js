import Sound from "./index"
const findFree = instances => {
    for (let i = instances.length - 1; i > -1; i--) {
        if (!instances[i].playing) {
            return instances[i]
        }
    }
}
class SoundPool {
    constructor({ resource, start, duration, size = 1, loop, volume, pan, speed }) {
        this.resource = resource
        this.start = start
        this.duration = duration
        this.instances = Array(size).fill(new Sound(resource, { loop, volume, pan, speed }))
    }
    play(volume) {
        const freeInstance = findFree(this.instances)
        if (freeInstance) {
            freeInstance.play(this.start, this.duration, volume)
            return
        }
        const newInstance = new Sound(this.resource)
        this.instances.push(newInstance)
        
        newInstance.play(this.start, this.duration, volume)
    }
    pause() {
        this.instances.forEach(instance => {
            instance.pause()
        })
    }
    resume() {
        this.instances.forEach(instance => {
            instance.resume()
        })
    }
}

export default SoundPool