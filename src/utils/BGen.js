import { BGenMachine } from "@lib/utils";
import Egypt from "./biomes/Egypt"
import Construction from "./biomes/Construction"

class BGen extends BGenMachine {
    constructor(atlasmeta, baseWidth=48, baseHeight=64) {
        super([ Egypt, Construction ], atlasmeta, baseWidth, baseHeight)
        this.setInitialBiome(Construction)
    }
}

export default BGen