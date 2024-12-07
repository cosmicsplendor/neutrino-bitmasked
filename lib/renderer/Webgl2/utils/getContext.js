export default cnvSelector => {
    const canvas = document.querySelector(cnvSelector)
    const gl = canvas.getContext("webgl2")
    if (!gl) {
        throw new Error(`Webgl support not available`)
    }
    return gl
}