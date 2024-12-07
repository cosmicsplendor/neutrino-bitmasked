export default class {
    constructor(key) {
        this.key = key
    }
    get() {
        return localStorage.getItem(this.key)
    }
    set(val) {
        localStorage.setItem(this.key, val)
    }
}