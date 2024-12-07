const getKeyCode = e => {
    const keyCode = e.which || e.keyCode
    if (typeof keyCode === "number") {
        return keyCode
    }
    switch(e.key) {
        case "Left": // for IE and Older Versions of Edge
        case "ArrowLeft": // Standard
            return 37
        case "Right":
        case "ArrowRight":
            return 39        
        case "Up":
        case "ArrowUp":
            return 38
        case "A":
        case "a":
            return 65
        case "D":
        case "d":
            return 68
        case "W":
        case "w":
            return 87
        case " ":
            return 32
        default:
            return -1
    }
}

class KeyControls {
    constructor(mappings) {
        this.mappings = mappings
        this.keys = { }
        for (const keyAlias in mappings) {
            const key = mappings[keyAlias]
            if (Array.isArray(key)) {
                for (const k of key) {
                    this.keys[k] = { pressed: false, held: false }
                }
                continue
            }
            this.keys[key] = { pressed: false, held: false }
        }
        this.keysArr = Object.values(this.keys)
        this.keysLen = this.keysArr.length

        document.addEventListener("keydown", e => {
            const keyCode = getKeyCode(e)
            const key = this.keys[keyCode]
            if (!!key) {
                key.held = true
                key.pressed = true
            }
        })

        document.addEventListener("keyup", e => {
            const keyCode = getKeyCode(e)
            const key = this.keys[keyCode]
            if (!!key) {
                key.held = false
            }
        })

        document.addEventListener("blur", this.resetAll.bind(this))
        window.addEventListener("blur", this.resetAll.bind(this))
    }
    get(keyAlias, attrib = "held") {
        const key = this.mappings[keyAlias]
        if (Array.isArray(key)) {
            return key.find(code => this.keys[code][attrib] === true)
        }
        return this.keys[key][attrib]
    }
    reset() {
        for (let i = this.keysLen - 1; i > -1; i--) {
            this.keysArr[i].pressed = false
        }
    }
    resetAll() {
        for (let i = this.keysLen - 1; i > -1; i--) {
            this.keysArr[i].pressed = false
            this.keysArr[i].held = false
        }
    }
}

export default KeyControls