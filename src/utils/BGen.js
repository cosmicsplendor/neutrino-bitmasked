import { BGenMachine } from "@lib/utils";
import Egypt from "./biomes/Egypt"

class BGen extends BGenMachine {
    constructor(atlasmeta, baseWidth=48, baseHeight=64) {
        super([ Egypt ], atlasmeta, baseWidth, baseHeight)
        this.setInitialBiome(Egypt)
    }
}

export default BGen