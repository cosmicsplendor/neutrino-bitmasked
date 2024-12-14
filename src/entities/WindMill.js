const { TexRegion } = require("@lib/index");
class WindMill extends TexRegion {

    constructor(props) {

        super(props)

        this.blade = new TexRegion({ frame: "sb_mill0" })

        const radius = this.blade.height * 0.5

        this.blade.pos.y = - radius + 2

        this.blade.pos.x = 11

        this.blade.rotation = 0

        this.blade.rotation = 0

        this.blade.anchor = { x: radius, y: radius }

        this.add(this.blade)
        this.scaleX = (this.scale && this.scale.x) || 1
    }

    update(dt) {
        this.blade.rotation += dt * 0.5 * this.scaleX
    }
}

export default WindMill