class TouchControls {
    constructor(mappings) {
        this.mappings = mappings
        this.btns = { }
        for (let btnAlias in mappings) {
            this.btns[btnAlias] = { pressed: false, held: false }
            const btn = mappings[btnAlias]
            btn.on("touchstart", () => {
                const m = this.btns[btnAlias] // button meta
                m.pressed = true
                m.held = true
            })
            btn.on("touchend", () => {
                const m = this.btns[btnAlias] // button meta
                m.pressed = false
                m.held = false
            })
        }
        this.btnsArr = Object.values(this.btns)
        this.btnsLen = this.btnsArr.length
    }
    get(btnAlias, attrib = "held") {
        return this.btns[btnAlias][attrib]
    }
    reset() {
        for (let i = this.btnsLen - 1; i > -1; i--) {
            this.btnsArr[i].pressed = false
        }
    }
}

export default TouchControls