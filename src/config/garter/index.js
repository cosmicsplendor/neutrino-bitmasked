import createConfig from "../create"
import GArter from "../../helpers/sdk/strategies/GArter"
import LocStorage from "../../helpers/storage/strategies/LocStorage"

export default createConfig({
    SDKStrat: GArter,
    StorageStrat: LocStorage,
    showAdOnRestart: 0,
    showAdOnResume: 0,
    prerollAd: true
})