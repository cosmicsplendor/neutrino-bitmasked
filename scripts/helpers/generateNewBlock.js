const { addProtrusions, fixHorizontalGap, fixVerticalGap } = require('./index');
const { detectProjectedEmptySpaces } = require("../utils/detectProjectedEmptySpaces");
const { CompositeBlock, rand, skewedRand, pickOne } = require("../utils/index");

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

const generateNewBlock = (prevBlock, map) => {
    const newBlock = CompositeBlock.create({
        width: rand(5, 1) + skewedRand(5, 1) + 1, // Width between 2 and 6
        height: skewedRand(3, 1) + rand(5, 1) // Height between 2 and 4
    });

    addProtrusions(newBlock);

    const expandDir = prevBlock.y < 4 || Math.random() < 0.5  ? "horizontal" : "vertical";
    if (expandDir === "horizontal") {
        const params = {
            position: pickOne(["right", "right-start", "right-end"]),
            dx: rand(10, -1),
            dy: 2 * (skewedRand(2, 1) + skewedRand(-2, -1)) + rand(rand(4, 1), - 4) + rand(5, -5)
        };
        newBlock.stackOn(prevBlock, params);
    } else {
        const emptySpaces = detectProjectedEmptySpaces(prevBlock, map);
        const params = pickVerticalAlignmentParams(emptySpaces);
        newBlock.stackOn(prevBlock, params);
    }

    const newEmptySpaces = detectProjectedEmptySpaces(newBlock, map);
    fixHorizontalGap(newBlock, newEmptySpaces);
    fixVerticalGap(newBlock, newEmptySpaces);

    return newBlock;
};

module.exports = generateNewBlock