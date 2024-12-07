var print = console.table || console.log

var elapsed = function(fn) {
    var start = performance.now()
    fn()
    var end = performance.now()
    return (end - start).toFixed(2)+ "ms"
}

var float = function(int) { return int + Math.random() }

var round = Math.round
var floor = Math.floor
var bitwiseFloor = function(num) { return ~~num }


var NUM_ITER = 1000000
var inputs = []
for (var i = 0; i < NUM_ITER; i++) {
    inputs[i] = float(i)
}

console.log("For " + NUM_ITER + " iterations")

var perf = { }

perf.round = elapsed(function() {
    for (var i = 0; i < NUM_ITER; i++) {
        round(inputs[i])
    }
})

perf.floor = elapsed(function() { // best
    for (var i = 0; i < NUM_ITER; i++) {
        floor(inputs[i])
    }
})

perf.bitwiseFloor = elapsed(function() { // worst
    for (var i = 0; i < NUM_ITER; i++) {
        bitwiseFloor(inputs[i])
    }
})

print(perf)