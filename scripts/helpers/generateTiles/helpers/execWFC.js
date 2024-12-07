const collapseCell = require("./collapseCell");
const postprocessGrid = require("./createGrid/postprocessGrid");
const findLowestEntropyCell = require("./findLowestEntropyCell");
const propagateConstraints = require("./propagateConstraints");
const sanitizeGrid = require("./sanitizeGrid")
function isFullyCollapsed(grid) {
    return grid.every(row => row.every(cell => {
        if (cell.type === "semi_collapsed") return false
        return (cell.length === 1 && typeof cell[0] === "string") || cell.length === 0
    }));
}
function execWFC(table, grid) {
    while (!isFullyCollapsed(grid)) {
        const { row, col } = findLowestEntropyCell(grid);
        collapseCell(grid, row, col);
        propagateConstraints(table, grid, row, col);
    }
    return postprocessGrid(sanitizeGrid(grid))
}

module.exports = execWFC