export const shapes = Object.freeze({
    RECT: "rectangle",
    CIRC: "circle",
    PLANK: "plank" // inclined-plane
})
export default entity => {
    const shape = entity.hitCirc ? shapes.CIRC: shapes.RECT
    const hitboxPresent = !!entity.hitbox
    const dimsPresent = !!entity.width && !!entity.height
    if (shape === shapes.RECT && !hitboxPresent && !dimsPresent) {
        throw new Error(`Unable to determine entity shape}`)
    }
    return shape
}