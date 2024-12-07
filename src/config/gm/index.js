import createConfig from "../create"
import GM from "../../helpers/sdk/strategies/GM"
import LocStorage from "../../helpers/storage/strategies/LocStorage"

export default createConfig({
    SDKStrat: GM,
    StorageStrat: LocStorage,
    showAdOnRestart: 0.3,
    showAdOnResume: 0.2,
    prerollAd: true
})