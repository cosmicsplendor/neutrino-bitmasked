var print = console.table || console.log

var elapsed = function(fn) {
    var start = performance.now()
    fn()
    var end = performance.now()
    return (end - start).toFixed(2)+ "ms"
}

var float = function(int) { return int + Math.random() }

var setLocalPos = function(node, globalPos) {
    let parent = node.parent
    let localPos = { }
    while (parent) {
        globalPos.x && (localPos.x = globalPos.x - parent.pos.x)
        globalPos.y && (localPos.y = globalPos.y - parent.pos.y)
        parent = parent.parent
    }
    node.pos = Object.assign({ }, node.pos, localPos)
}

var setLocalPosY = function(node, globalPosY) {
    let parent = node.parent
    let localPosY
    while (parent) {
        localPosY = globalPosY - parent.pos.y
        parent = parent.parent
    }
    node.pos.y = localPosY
}

var testNode = {
    pos: { x: 0, y: 0 },
    parent: {
        pos: { x: 10, y: 10 }
    }
}

var NUM_ITER = 1000000

console.log("For " + NUM_ITER + " iterations")

var perf = { }

perf["object super-spawner"] = elapsed(function() {
    for (var i = 0; i < NUM_ITER; i++) {
        setLocalPos(testNode, { y: i })
    }
})

perf["lean algorithm"] = elapsed(function() { // 10x faster
    for (var i = 0; i < NUM_ITER; i++) {
        setLocalPosY(testNode, i)
    }
})


print(perf)