const saws = (data = { name: "saw2", field: "width", dims: { width: 0, height: 0 }, xOffset: 0 }) => {
    const dims = data.dims ?? (data.field === "width" ? { width: 72, height: 24 } : { width: 24, height: 72 })
    const xOffset = data.xOffset ?? 0
    return {
        fields: [data.field],
        dims: ({ width: w = 1, height: h = 1 }) => {
            return {
                width: w * dims.width,
                height: h * dims.height
            }
        },
        create(params) {
            const { x, y, width, height } = params
            if (data.field === "height") {
                return Array(+height).fill(0).map((_, i) => {
                    return { x: x, y: y + (i * dims.height), name: data.name, groupId: "spikes" }
                })
            }
            return Array(+width).fill(0).map((_, i) => {
                return { x: x + (i + 1) * xOffset + i * dims.width, y: y, name: data.name, groupId: "spikes" }
            })
        }
    }
}

module.exports = saws