const sanitizeGrid = grid => {
    return grid.map(row => {
        return row.map(cell => {
            if (!Array.isArray(cell) || cell.length > 1) return "empty"
            if (cell.length === 0) return "empty"
            return typeof cell[0] === "string" ? cell[0]: "empty"
        })
    })
}

module.exports = sanitizeGrid