export default (gl, vertShader, fragShader) => {
    const program = gl.createProgram()
    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)
    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!success) {
        throw new Error(`Couldnt link shaders: ${gl.getProgramInfoLog(program)}`)
    }
    return program
}