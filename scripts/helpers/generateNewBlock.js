const { addProtrusions, fixHorizontalGap, fixVerticalGap } = require('./index');
const terminal = require('terminal-kit').terminal;
const { detectProjectedEmptySpaces } = require("../utils/detectProjectedEmptySpaces");
const { CompositeBlock, rand, skewedRand, pickOne } = require("../utils/index");
const { promptFields, message } = require('./term');

const pickVerticalAlignmentParams = (emptySpaces) => {
    const { bottom } = emptySpaces;
    const above = Math.random() < 0.35
    if (bottom.h > 10) { // if the bottom projection has big enough height meaning the building is tall enough and there's plent of space below
        return { position: "right-end", dy: 4 + rand(4), dx: 1 + rand(2, 1) };
    }
    if (above) {
        return {
            position: pickOne(["top", "top-start", "top-end"]),
            dx: 0,
            dy: skewedRand(4, 1) + rand(5)
        }
    }
    return {
        position: pickOne(["right", "right-end", "right-start", "top", "top-start", "top-end"]),
        dy: rand(12, 2) * (Math.random < 0.5 ? -1: 1),
        dx: rand(12) + skewedRand(5, 1)* (Math.random < 0.5 ? -1: 1)
    };
};
let validAlignments = [
    "top-start", "top", "top-end",
    "right-start", "right", "right-end",
    "bottom-start", "bottom", "bottom-end",
    "left-start", "left", "left-end"
];
const generateNewBlock = async prevBlock => {
    message("Let's add a new Block", "brightGreen")
  
    const {
        Width: width, Height: height
    } = await promptFields([ "Width", "Height" ])

    let alignment = (await promptFields(['Alignment']))['Alignment'];
    
    while (!validAlignments.includes(alignment)) {
        terminal.red('Invalid alignment. Please choose from: ' + validAlignments.join(', ') + '\n');
        alignment = (await promptFields(['Alignment']))['Alignment'];
    }

    const {
        delX: dx, "delY": dy
    } = await promptFields([ "delX", "delY"])

    const newBlock = CompositeBlock.create({ width: Number(width) || 1, height: Number(height) || 1 });
    newBlock.stackOn(prevBlock, {
        position: alignment,
        dx: Number(dx) || 1, dy: Number(dy) || 1
    })
    // const expandDir = prevBlock.y < 4 || Math.random() < 0.5  ? "horizontal" : "vertical";
    // if (expandDir === "horizontal") {
    //     const params = {
    //         position: pickOne(["right", "right-start", "right-end"]),
    //         dx: rand(10, -1),
    //         dy: 2 * (skewedRand(2, 1) + skewedRand(-2, -1)) + rand(rand(4, 1), - 4) + rand(5, -5)
    //     };
    //     newBlock.stackOn(prevBlock, params);
    // } else {
    //     const emptySpaces = detectProjectedEmptySpaces(prevBlock, map);
    //     const params = pickVerticalAlignmentParams(emptySpaces);
    //     newBlock.stackOn(prevBlock, params);
    // }

    // const newEmptySpaces = detectProjectedEmptySpaces(newBlock, map);
    // fixHorizontalGap(newBlock, newEmptySpaces);
    // fixVerticalGap(newBlock, newEmptySpaces);

    return newBlock;
};

module.exports = generateNewBlock