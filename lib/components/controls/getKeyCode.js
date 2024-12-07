export default e => {
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