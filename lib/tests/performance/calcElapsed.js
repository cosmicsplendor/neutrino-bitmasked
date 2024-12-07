const elapsed = fn => {
    const start = performance.now()
    fn()
    const end = performance.now()
    return (end - start).toFixed(2)
}