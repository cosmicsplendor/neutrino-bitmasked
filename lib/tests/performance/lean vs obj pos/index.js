var print = console.table || console.log

var elapsed = function(fn) {
    var start = performance.now()
    fn()
    var end = performance.now()
    return (end - start).toFixed(2)+ "ms"
}


var NUM_ITER = 1000000

console.log("For " + NUM_ITER + " iterations")

var perf = { }

perf.lean = elapsed(function() { // 2.5x better performance
    entities = []
    for (var i = 0; i < NUM_ITER; i++) {
        entities.push({ x: i, y: i })
    }
    for (var i = 0; i < NUM_ITER; i++) {
        var entity = entities[i]
        entity.x++
        entity.y++
    }
})

perf.obj = elapsed(function() { 
    entities = []
    for (var i = 0; i < NUM_ITER; i++) {
        entities.push({
            pos: {  x: i, y: i }
        })
    }
    for (var i = 0; i < NUM_ITER; i++) {
        var entity = entities[i]
        entity.pos.x++
        entity.pos.y++
    }
})



print(perf)