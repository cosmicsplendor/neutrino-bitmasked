import { TexRegion } from "@lib"
class Magnet extends TexRegion {
    constructor(props) {
        super(props)
        this.tint = [ 0, 0, 0, 0 ]
        this.vel = 1
        this.tintVal = 0
        this.forceUpdate = true
    }
    update(dt) {
        this.tintVal += dt * 0.2 * this.vel
        if (this.tintVal > 0.16) {
            this.vel = -1
            this.tintVal = 0.16
        } else if (this.tintVal < 0) {
            this.vel = 1
            this.tintVal = 0
        }
        this.tint[0] = this.tintVal
        this.tint[1] = this.tintVal
        this.tint[2] = this.tintVal
    }
}

// const makeFlashMixin = cycle => ({
//     tint: [ 0, 0, 0, 0 ],
//     elapsed: 0,
//     TIME: cycle,
//     bright: false,
//     brighten() {
//         this.bright = true
//         this.tint[0] = 0.1
//         this.tint[1] = 0.1
//         this.tint[2] = 0.1
//     },
//     resetTint() {
//         this.bright = false
//         this.tint[0] = 0
//         this.tint[1] = 0
//         this.tint[2] = 0
//     },
//     update(dt) {
//         this.elapsed += dt
//         if (this.elapsed > this.TIME) {
//             this.elapsed = 0
//             switch(this.bright) {
//                 case true:
//                     this.resetTint()
//                 break
//                 case false:
//                     this.brighten()
//             }
//         }
//     }
// })

export default Magnet