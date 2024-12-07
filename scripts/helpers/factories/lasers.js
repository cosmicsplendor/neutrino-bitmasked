const TILE_SIZE = 48
const lasers = (orientation) => {
    const fields = ['speed', 'period', 'on']
    if (orientation === "vertical") {
        fields.unshift("toX")
    }
    if (orientation === "horizontal") {
        fields.unshift("toY")
    }
    return {
        fields: fields, // Inferred from Laser constructor
        fieldsFilter: (name, prevParams) => {
            if (name === "speed" && (+prevParams.toX === 0 || +prevParams.toY === 0)) {
                return false
            }
            return true
        },
        create: (params) => {
            const { x, y, toX, toY, speed, period, on, name, projection } = params
            return {
                x, y,
                toX: x + Number(toX) * TILE_SIZE, toY: y + Number(toY) * TILE_SIZE,
                name: name, on: Boolean(on),
                period: +period, speed: +speed, num: orientation === "horizontal" ? projection.w: projection.h
            }
        }
    }
}

module.exports = lasers