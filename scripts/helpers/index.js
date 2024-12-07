const { CompositeBlock, rand, skewedRand, pickOne } = require("../utils");

const addProtrusions = (block) => {
    if (block.w > 2 && rand(10) > 5) {
        if (rand(10) > 3) {
            block.addPart({ width: 2, height: 2, position: pickOne(["bottom", "bottom-start", "bottom-end"]) });
        }
        if (rand(10) > 3) {
            block.addPart({
                width: skewedRand(block.w - 1, 2),
                height: skewedRand(3, 2),
                position: pickOne(["top", "top-start", "top-end"])
            });
        }
    }
    if (rand(10) > 8 && block.h > 2) {
        block.addPart({
            height: skewedRand(block.h - 1, 2),
            width: skewedRand(3, 2),
            position: pickOne(["left", "left-start", "left-end"])
        });
    }
};

const getInitialBlock = (floor, graph) => {
    /**
     * Generate a random width and height within a range.
     */
    const getRandomDimension = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Define a maximum combined area for both blocks
    const maxCombinedArea = 10;  // Set this to your desired limit (e.g., 30)

    // Probability of no part being added (just the initial block)
    const noPartProb = Math.random();

    // Probability logic for heights:
    // 70% chance for similar or reverse scenario, 30% for significant height difference
    const heightDifferenceProb = Math.random();
    let initialHeight;
    let secondHeight;
    let initialWidth;
    let secondWidth;

    if (noPartProb <= 0.2) {
        // 20% chance that no part is added, just a thin tall wall
        initialWidth = getRandomDimension(1, 2);  // Thin width
        initialHeight = getRandomDimension(6, 9);  // Tall height
    } else {
        // Otherwise, proceed with regular height and width logic

        if (heightDifferenceProb <= 0.5) {
            // 70% chance: prefer smaller heights when blocks are equal or second is taller
            initialHeight = getRandomDimension(3, 6); // Smaller initial height
            secondHeight = initialHeight; // Second block has the same height
        } else {
            // 30% chance: first block is significantly taller, prefer larger heights
            initialHeight = getRandomDimension(3, 5); // Taller initial height
            secondHeight = getRandomDimension(2, Math.floor(initialHeight / 2)); // Second block is much smaller
        }

        // Generate random width for the first block
        initialWidth = getRandomDimension(2, 4);

        // Calculate the area of the first block
        const firstArea = initialWidth * initialHeight;

        // Ensure there's enough remaining area for a second block
        const remainingArea = maxCombinedArea - firstArea;

        if (remainingArea > 0) {
            // Try to generate a second block that fits within the remaining area
            const maxSecondWidth = Math.min(initialWidth + 1, Math.floor(remainingArea / secondHeight));  // Ensure it fits in the area

            if (maxSecondWidth > 0) {
                // Generate width for the second block constrained by remaining area
                secondWidth = getRandomDimension(Math.max(1, initialWidth - 1), maxSecondWidth);
                const secondArea = secondWidth * secondHeight;

                // Check if the second block has a valid non-zero area
                if (secondArea > 0 && firstArea + secondArea <= maxCombinedArea) {
                    // Add the second part to the composite block
                    const leftWall = CompositeBlock.create({ width: initialWidth, height: initialHeight })
                        .addPart({
                            // Second part with calculated width and height
                            width: secondWidth,
                            height: secondHeight,
                            position: "right-end",
                            onto: "last"
                        });

                    // Stack the block on top of the floor and set it in the graph
                    leftWall.stackOn(floor, { position: "top-start" });
                    graph.setNode(0, leftWall);

                    return leftWall;
                }
            }
        }
        
        // If no second block or no valid area, just return the first block
        const leftWall = CompositeBlock.create({ width: initialWidth, height: initialHeight });
        leftWall.stackOn(floor, { position: "top-start" });
        graph.setNode(0, leftWall);

        return leftWall;
    }

    // If no part is added, create a simple thin, tall wall
    const thinTallWall = CompositeBlock.create({ width: initialWidth, height: initialHeight });
    thinTallWall.stackOn(floor, { position: "top-start" });
    graph.setNode(0, thinTallWall);

    return thinTallWall;
};




const fixHorizontalGap = (block, emptySpaces) => {
    const { left, right } = emptySpaces;
    if (right.w === 1) {
        return block.shift(1);
    }
    if (left.w === 1) {
        return block.shift(-1);
    }
};

const fixVerticalGap = (block, emptySpaces) => {
    const { top, bottom } = emptySpaces;
    if (bottom.h === 1) {
        return block.shift(0, 1);
    }
    if (top.h === 1) {
        return block.shift(0, -1);
    }
};
module.exports = {
    addProtrusions,
    getInitialBlock,
    fixHorizontalGap,
    fixVerticalGap
}