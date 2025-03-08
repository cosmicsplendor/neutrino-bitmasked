const TILE_SIZE = 48
const sawBlades = (nameMap, static=false) => {
    return {
        fields: static ? ["size"]: ['toX', 'toY', 'speed', "size", "dx", "dy"], // Based on SawBlade constructor
        dims: (params, atlas) => {
            const { width, height } = atlas[nameMap[params.size ?? "large" ] ?? nameMap.large]
            return { width, height }
        },
        create: (params) => {
            const { x, y, toX, toY, speed, size, dx, dy } = params
            if (static) return { x, y, name: nameMap[size] }
            return {
                // these should come in relative grid space
                x: x  + +dx * TILE_SIZE, y: y + +dy * TILE_SIZE,
                toX: x + Number(toX) * TILE_SIZE,
                toY: y + Number(toY) * TILE_SIZE,
                name: nameMap[size],
                speed: +speed
            }
        }
    }
}

module.exports = sawBlades