const validateOrientation = mode => mode === "landscape" || mode === "portrait"
export const orient = mode => {
    const isValid = validateOrientation(mode)
    if (!isValid) {
        throw new Error(`Requested an invalid orientation mode: ${mode}`)
    }
    try {
        const curMode = screen.orientation
        const modeRegex = new RegExp(`${mode}`)
        if (modeRegex.test(curMode)) {
            return
        }
        screen.orientation.lock(mode).catch(() => {})
    } catch (e) {  }
}
export const wait = s => {
    return new Promise((resolve) => {
        setTimeout(resolve, s * 1000)
    })
}