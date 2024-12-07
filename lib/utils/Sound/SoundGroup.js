class SoundGroup {
    constructor(mutations) { // a list of slightly varying mutations of a sound (pool)
        this.mutations = mutations
        this.accessIdx = 0
    }
    play(volume) {
        const { mutations, accessIdx } = this
        mutations[accessIdx].play(volume)
        this.accessIdx = (accessIdx + 1) % mutations.length // round robin algorithm
    }
    pause() {
        this.mutations(mutation => {
            mutation.pause()
        })
    }
    resume() {
        this.mutations(mutation => {
            mutation.resume()
        })
    }
}

export default SoundGroup