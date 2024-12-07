const fs = require("fs/promises")
const atlasPath = "./src/assets/images/atlasmeta.cson"

const getAtlas = async () => {
    const buffer = await fs.readFile(atlasPath)
    const data = JSON.parse(buffer.toString("utf-8"))
    const entries = Object.entries(data)
    entries.forEach(e => {
        if (!e[1].rotation) return
        const { width, height } = e[1]
        e[1].width = height
        e[1].height = width
    })
    return Object.fromEntries(entries)
}
const atlasCache = {
    atlas: null,
    async contains(key) {
        const atlas = await this.get()
        return Object.keys(atlas).includes(key)
    },
    async get() {
        if (this.atlas === null) {
            this.atlas = await getAtlas()
        }
        return this.atlas
    }
}

module.exports = atlasCache