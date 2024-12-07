const overlaps = (r1, r2) =>
    r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;

// Function to find the nearest collision in a given direction
const findNearestCollision = (edge, isHorizontal, collisionRects, rect, map) => {
    let nearest = isHorizontal ? (edge === 'left' ? 0 : map.w) : (edge === 'top' ? 0 : map.h);

    collisionRects.forEach(collisionRect => {
        if (isHorizontal) {
            if (edge === 'left' && collisionRect.x + collisionRect.w <= rect.x &&
                collisionRect.y < rect.y + rect.h && collisionRect.y + collisionRect.h > rect.y) {
                nearest = Math.max(nearest, collisionRect.x + collisionRect.w);
            } else if (edge === 'right' && collisionRect.x >= rect.x + rect.w &&
                collisionRect.y < rect.y + rect.h && collisionRect.y + collisionRect.h > rect.y) {
                nearest = Math.min(nearest, collisionRect.x);
            }
        } else {
            if (edge === 'top' && collisionRect.y + collisionRect.h <= rect.y &&
                collisionRect.x < rect.x + rect.w && collisionRect.x + collisionRect.w > rect.x) {
                nearest = Math.max(nearest, collisionRect.y + collisionRect.h);
            } else if (edge === 'bottom' && collisionRect.y >= rect.y + rect.h &&
                collisionRect.x < rect.x + rect.w && collisionRect.x + collisionRect.w > rect.x) {
                nearest = Math.min(nearest, collisionRect.y);
            }
        }
    });

    return nearest;
};
function detectProjectedEmptySpaces(rect, map) {
    // Remove duplicate collision rectangles
    // Helper function to check if two rectangles overlap

    // Remove duplicate collision rectangles
    const uniqueCollisionRects = map.collisionRects.filter(r =>
        !overlaps(r, rect)
    );

    // Calculate projected rectangles
    const left = {
        x: findNearestCollision('left', true, uniqueCollisionRects, rect, map),
        y: rect.y,
        w: Math.max(0, rect.x - findNearestCollision('left', true, uniqueCollisionRects, rect, map)),
        h: rect.h
    };

    const right = {
        x: rect.x + rect.w,
        y: rect.y,
        w: Math.max(0, findNearestCollision('right', true, uniqueCollisionRects, rect, map) - (rect.x + rect.w)),
        h: rect.h
    };

    const top = {
        x: rect.x,
        y: findNearestCollision('top', false, uniqueCollisionRects, rect, map),
        w: rect.w,
        h: Math.max(0, rect.y - findNearestCollision('top', false, uniqueCollisionRects, rect, map))
    };

    const bottom = {
        x: rect.x,
        y: rect.y + rect.h,
        w: rect.w,
        h: Math.max(0, findNearestCollision('bottom', false, uniqueCollisionRects, rect, map) - (rect.y + rect.h))
    };

    // Ensure projections stay within map boundaries
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    [left, right, top, bottom].forEach(r => {
        r.x = clamp(r.x, 0, map.w);
        r.y = clamp(r.y, 0, map.h);
        r.w = clamp(r.w, 0, map.w - r.x);
        r.h = clamp(r.h, 0, map.h - r.y);
    });

    return {left, right, top, bottom};
}

module.exports = {
    overlaps,
    findNearestCollision,
    detectProjectedEmptySpaces,
}