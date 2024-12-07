import Timer from "./Timer"
export const fadeOut = (entity, alpha0, duration, onDone) => {
    entity.add(new Timer( 
        duration, 
        nt => { // normalized time (elapsed)
            entity.alpha = alpha0 * (1 - nt)
        }, 
        onDone
    ))
}
export const fadeIn = (entity, alpha, duration, onDone) => {
    entity.add(new Timer({ 
        duration, 
        onTick: nt => { // normalized time (elapsed)
            console.log(entity.alpha)
            entity.alpha = Math.min(alpha, nt)
        }, 
        onDone
    }))
}