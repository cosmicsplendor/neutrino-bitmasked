var print = console.table || console.log

var elapsed = function(fn) {
    var start = performance.now()
    fn()
    var end = performance.now()
    return (end - start).toFixed(2)+ "ms"
}

var roundFloat = function(num, place) {
    return Math.round(num * place) / place
}

var fixedAabb = function(b1, b2) {
    if (
        roundFloat(b1.x + b1.width, 10000) <= roundFloat(b2.x, 10000) || 
        roundFloat(b1.x, 10000) >= roundFloat(b2.x + b2.width, 10000) ||
        roundFloat(b1.y + b1.height, 10000) <= roundFloat(b2.y, 10000) ||
        roundFloat(b1.y, 10000) >= roundFloat(b2.y + b2.height, 10000)
    ) {
            return false
    }
    return true
}

var float = function(int) {
    return int + Math.random()
}

var aabb = function(b1, b2) {
    if (
        b1.x + b1.width <= b2.x || 
        b1.x >= b2.x + b2.width ||
        b1.y + b1.height <= b2.y ||
        b1.y >= b2.y + b2.height
    ) {
            return false
    }
    return true
}

var b1 = { x: 10, y: 10, width: 10, height: 10 }
var b2 = { x: 18, y: 18, width: 20, height: 20 }
var b1_float = { x: float(b1.x), y: float(b1.y), width: float(b1.width), height: float(b1.height) }
var b2_float = { x: float(b2.x), y: float(b2.y), width: float(b2.width), height: float(b2.height) }

var NUM_ITER = 1000000

console.log("For " + NUM_ITER + " iterations")

var perf = { }

perf["Normal AABB"] = {
    int: elapsed(function() {
        for (var i = 0; i < NUM_ITER; i++) {
            aabb(b1, b2)
        }
    }),
    float: elapsed(function() {
        for (var i = 0; i < NUM_ITER; i++) {
            aabb(b1_float, b2_float)
        }
    }),
}
perf["Rounded AABB"] = {
    int: elapsed(function() {
        for (var i = 0; i < NUM_ITER; i++) {
            fixedAabb(b1, b2)
        }
    }),
    float: elapsed(function() {
        for (var i = 0; i < NUM_ITER; i++) {
            fixedAabb(b1_float, b2_float)
        }
    }),
}

print(perf)