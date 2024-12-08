const terminal = require('terminal-kit').terminal;
const { getInitialBlock } = require('./helpers');
const { getChoice, promptAccept } = require("./helpers/term")
const generateNewBlock = require("./helpers/generateNewBlock")
const { Map } = require("./utils/index");
const { Graph } = require('graphlib'); // Use a graph library
const placeObjects = require('./helpers/placeObjects');
const { generateTiles, placeTiles } = require('./helpers/generateTiles');
const generateFloor = require('./helpers/generateFloor');
const fixBoundaries = require('./helpers/fixBoundaries');
const projectBackwalls = require('./helpers/projectBackwalls');
const selectColors = require('./helpers/selectColors');
const colors = selectColors()

const mapData = {
    width: 70,
    height: 30,
    speed:400,
    mxJmpVel: -400,
    mob_bg: "rgb(18 18 18)",
    ...colors,
    floorHeight: 3,
}
const initializeMap = () => {
    const map = new Map(mapData);
    return map
}
const initializeGraph = () => new Graph({ directed: true });

const reconstructMap = (map, blocks) => {
    map.clear(); // Clear the existing map
    blocks.forEach(block => {
        block.addToMap()
    });
};

const interactiveGenerateLevel = async () => {
    // const loadSaved = await promptAccept("Do you want to load saved data?")
    const loadSaved = false

    let blocks, map 
    let graph = initializeGraph();

    if (loadSaved) {
        const loaded = await Map.fromSaved()
        blocks = loaded.blocks
        blocks.slice(1).forEach((block, i) => {
            graph.setNode(i, block)
        })
        map = loaded.blocks
    } else {
        map = initializeMap(graph);
        const floor = generateFloor(map)
        blocks = [floor];
    
        const initialBlock = getInitialBlock(floor, graph)
        blocks.push(initialBlock)
        reconstructMap(map, blocks)
    
        /**
         * take the map, scan every block within +-1 for edge tiles that are out of alignment
         */
        await fixBoundaries(map, initialBlock)
        await map.exportMap("testlevel")
    }

    let iter = blocks.length - 1;
    await placeObjects(graph.node(iter - 1), map)
    while (true) {
        const lastBlock = graph.node(iter - 1);
        let newBlock = generateNewBlock(lastBlock, map);
        if (newBlock.x < 0 || newBlock.y + newBlock.h > map.h - (map.floorHeight ?? 4)) {
            // out of bounds or partly occluded by floor so retry
            continue;
        }

        reconstructMap(map, [...blocks, newBlock])
        map.addPreviewColRects(newBlock.collisionRects)
        await map.exportMap("testlevel")

        const choices = ["Retry", "Proceed", "Proceed & Terminate", "Discard & Terminate"]
        const response = await getChoice(choices, "Like this block?");
        const proceedAndTerminate = response === choices[2]
        const discardAndTerminate = response === choices[3]
        const terminate = proceedAndTerminate || discardAndTerminate
        const userAccepted = response === choices[1] || proceedAndTerminate

        if (userAccepted) {
            map.clearPreviewColRects()
            map.centerCamera(newBlock)
            await placeObjects(newBlock, map)
            await map.exportMap("testlevel")

            graph.setNode(iter, newBlock);
            blocks.push(newBlock);
            iter++;
            await map.save()
            if (terminate) break
        } else {
            terminal.red("Retrying current iteration...\n");
            map.clearPreviewColRects()
            reconstructMap(map, blocks)
            if (terminate) break
        }
    }

    // for (const block of blocks) {
    //     map.centerCamera(block)
    //     await placeObjects(block, map)
    //     await map.save()
    // }
    terminal("\nFinal Level:\n");
    terminal("\nLevel design complete. Press any key to exit.\n");
    terminal.grabInput(true);
    terminal.on('key', () => process.exit());
};

terminal.on('key', (name) => {
    if (name === 'CTRL_C' || name === 'ESCAPE') {
        console.log('\nExiting application...');
        terminal.grabInput(false); // Disable input grabbing
        process.exit(); // Terminate the app
    }
})

interactiveGenerateLevel();
