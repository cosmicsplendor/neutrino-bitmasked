export default class {
    constructor(key) {
        this.key = key
    }
    get() {
        return GamePix.localStorage.getItem(this.key)
    }
    set(val) {
        GamePix.localStorage.setItem(this.key, val)
    }
}