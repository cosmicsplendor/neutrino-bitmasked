import createConfig from "../create"
import GPix from "../../helpers/sdk/strategies/GPix"
import GPixStorage from "../../helpers/storage/strategies/GPixStorage"

export default createConfig({
    SDKStrat: GPix,
    StorageStrat: GPixStorage,
    showAdOnRestart: 0,
    showAdOnResume: 0,
    prerollAd: false
})