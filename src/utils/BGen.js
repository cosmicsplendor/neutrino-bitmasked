import { BGenMachine } from "@lib/utils";
import Egypt from "./biomes/Egypt"
import Construction from "./biomes/Construction"
import Exotica from "./biomes/Exotica"
import Japan from "./biomes/Japan"
import Industrial from "./biomes/Industrial"
import Medieval from "./biomes/Medieval"
import Ruins from "./biomes/Ruins"
import Suburb from "./biomes/Suburb"

class BGen extends BGenMachine {
    constructor(atlasmeta, entityMap, baseWidth=48, baseHeight=64) {
        super([ Egypt, Construction, Exotica, Japan, Industrial, Suburb, Ruins, Medieval ], atlasmeta, entityMap, baseWidth, baseHeight)
        this.setInitialBiome(Suburb)
    }
}

export default BGen