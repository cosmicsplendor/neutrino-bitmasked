const createNoAudio = () => {
    return class {
        static off() {}
        static on() { }
        static loadResource = src => {
            return Promise.resolve(src)
        }
        static destroy() { }
        pause() { }
        resume() { }
        play() { }
    }
}
export default createNoAudio