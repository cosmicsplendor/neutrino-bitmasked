const execWFC = require("./helpers/execWFC");
const table = require("./adjacencyTable.js");
const createGrid = require("./helpers/createGrid");

const placeTiles = (map, block, grid) => {
  const doneTiles = []
  grid.forEach((row, j) => {
    row.forEach((cell, i) => {
      const x = block.x + i
      const y = block.y + j
      const prevCell = map.getTile(x, y, "fg")
      map.setTile(x, y, cell === "empty" ? null: cell, "fg")
      doneTiles.push({ x, y, cell: prevCell })
    })
  })

  return function undo() {
    doneTiles.forEach(tile => {
      map.setTile(tile.x, tile.y, tile.cell)
    })
  }
}

const generateTiles = (block) => { // takes in composite block
  const grid = createGrid(block, Object.keys(table))
  return execWFC(table, grid)
}

const generateTileSpawnPoints = (block, tileW, tileH=tileW, x=block.x, y=block.y, replacer) => {
    const grid = generateTiles(block)
    return grid
    .map((row, j) => {
      return row.map((cell, i) => {
        return { x: x + i * tileW, y: y + j * tileH, name: typeof replacer === "function" ? replacer(j, i, cell): cell }
      })
    })
    .flat()
    .filter(sp => sp.name !== "empty")
}


module.exports = { placeTiles, generateTiles, generateTileSpawnPoints }