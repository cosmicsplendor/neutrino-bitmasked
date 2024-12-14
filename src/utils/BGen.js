import { BGenMachine } from "@lib/utils";
import Egypt from "./biomes/Egypt"
import Construction from "./biomes/Construction"
import Exotica from "./biomes/Exotica"
import Japan from "./biomes/Japan"
import Industrial from "./biomes/Industrial"
import Medieval from "./biomes/Medieval"
import Ruins from "./biomes/Ruins"
import Suburb from "./biomes/Suburb"
import WindMill from "../entities/WindMill";
import { pickOne } from "@lib/utils/math";

class BGen extends BGenMachine {
    constructor(atlasmeta, baseWidth=48, baseHeight=64) {
        const constructors = [ Egypt, Construction, Exotica, Japan, Industrial, Suburb, Ruins, Medieval ]
        super(constructors, atlasmeta, { sb_mill: WindMill }, baseWidth, baseHeight)
        this.setInitialBiome(pickOne(constructors))
    }
}

export default BGen