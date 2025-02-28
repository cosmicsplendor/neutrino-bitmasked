const terminal = require('terminal-kit').terminal;
const { getChoice, promptAccept, message, promptFields } = require("./term")
const projectCompositeRects = require('../utils/projectCompositeRects');
const factories = require("./factories");
const { align, validAlignments } = require('./alignment');
const atlasCache = require('./atlasCache');
const applyOffsets = require('./applyOffsets');

const queryAlignment = async () => {
    const { Alignment } = await promptFields(["Alignment"])
    const valid = validAlignments.includes(Alignment)
    if (!valid) {
        terminal.bold.red(`o oh, '${Alignment}' doesn't make sense. Let's try again. .\n`)
        return queryAlignment()
    }
    return Alignment
}

const placeObject = async (index, projections, map) => {
    const total = projections.length
    const indexInd = `[${index + 1} of ${total}] `

    const skipResponse = await getChoice(["Proceed", "Pass", "Pass All"], `Projection ${indexInd}`)
    if (skipResponse !== "Proceed") return skipResponse

    const projection = projections[index]

    message(indexInd + "Let's place some objects. .", "cyan");

    while (true) {
        while (true) {
            const { Name: name } = await promptFields(["Name"]);
            const validName = await atlasCache.contains(name) || name === "checkpoint" || name === "player" || Object.keys(factories).includes(name)

            if (!validName) {
                message(`Invalid name '${name}'`, "red")
                terminal.bold.green("Let's try again. .\n")
                continue
            }

            const alignment = await queryAlignment()
            const factory = name in factories ? factories[name]: factories.default
            if (factory.possible && !factory.possible(projection, alignment)) {
                message(`Impossible configuration right there. .`, "red")
                terminal.bold.green("Let's try again. . \n")
                continue
            }
            const moreFields = factory.fields
            const props = (Array.isArray(moreFields)) ? await promptFields(moreFields, factory.fieldsFilter): {}



            const choices = ['Proceed', 'Retry', 'Discard']
            if (factory?.randomize) choices.unshift("Randomize")

            let nextMove = "Randomize" // start off with randomize to get the first iteration running
            while (nextMove === "Randomize") {
                await map.clearTempSpawnPoint()
                // compute coordinates based on alignment
                const coords = await align(name, projection, alignment, props)
                const offsetCoords = await applyOffsets(coords.x, coords.y, name, alignment, props)
                const spawnPoint = factory.create({ name, alignment, projection, ...offsetCoords, ...props })
                await map.addTempSpawnPoint(spawnPoint)

                nextMove = await getChoice(choices);
            }

            if (nextMove === "Proceed") {
                await map.commitTempSpawnPoint()
                message(`${name} successfully placed`, "blue")
                break
            }

            // undo the last temp spawn point addition in case of retry/discard
            await map.clearTempSpawnPoint()
            if (nextMove === "Discard") break

            message("Let's try again. .", "green")
        }

        const addMore = await promptAccept("Add another object?");
        if (!addMore) break

        message(indexInd + "Let's place one more object. .");
    }
};


const placeObjects = async (newBlock, map) => {
    const projections = projectCompositeRects(newBlock, map.collisionRects, map)
    for (const index in projections) {
        const projection = projections[index]
        map.projections.push(projection);
        await map.exportMap();
        const response = await placeObject(Number(index), projections, map)
        map.projections.length = 0
        if (response === "Pass All") {
            await map.exportMap()
            break
        }
    }
    map.projections.length = 0
}

module.exports = placeObjects