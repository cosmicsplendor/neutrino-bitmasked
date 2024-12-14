import { BGenMachine } from "@lib/utils";
import Egypt from "./biomes/Egypt"
import Construction from "./biomes/Construction"
import Exotica from "./biomes/Exotica"
import Japan from "./biomes/Japan"
import Industrial from "./biomes/Industrial"
import Medieval from "./biomes/Medieval"
import Ruins from "./biomes/Ruins"

class BGen extends BGenMachine {
    constructor(atlasmeta, baseWidth=48, baseHeight=64) {
        super([ Egypt, Construction, Exotica, Japan, Industrial, Ruins, Medieval ], atlasmeta, baseWidth, baseHeight)
        this.setInitialBiome(Ruins)
    }
}

export default BGen