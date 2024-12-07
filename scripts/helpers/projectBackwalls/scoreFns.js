const scoreArea = a => {
    if (a <= 6) {
        return 1;
    } else {
        return Math.min(6 * Math.pow(a, -0.9), 1);  // Adjust the exponent for slower decay
    }
}

const scoreSupportingWidth = (width, supportingWidth, height, decayRate = 0.2) => {
    // Non-linear decay based on height
    const heightFactor = Math.exp(-decayRate * (height - 1)); // Starts at 1 for h = 1 and decays as h increases
    // Compute base score using width and supporting width ratio
    const widthRatio = supportingWidth / width;

    // Adjust score based on non-linear height factor
    const finalScore = widthRatio * heightFactor;

    // Ensure score stays in 0-1 range
    return Math.max(0, Math.min(finalScore, 1));
};
function scoreWidth(x) {
    if (x < 1) return 0
    const clampedX = Math.min(Math.max(x, 1), 9);

    let normalized = (clampedX) / 9;

    // Apply a non-linear transformation to the second half to speed up decay
    if (normalized > 0.5) {
        // Exaggerate the rate of decay for values greater than 0.5
        normalized = 0.5 + Math.pow((normalized - 0.5) * 2, 0.25) / 2;
    }

    // Create a bell-shaped curve using the modified normalized value
    const score = Math.sin(normalized * Math.PI);

    // Adjust the range to start from a small non-zero value
    const minScore = 0;
    return minScore + (1 - minScore) * score;
}

module.exports = {
    scoreArea,
    scoreSupportingWidth,
    scoreWidth
}