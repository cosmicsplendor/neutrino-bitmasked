import createConfig from "../create"
import LocStorage from "../../helpers/storage/strategies/LocStorage"

export default createConfig({
    SDKStrat: null,
    StorageStrat: LocStorage,
    showAdOnRestart: 0,
    showAdOnResume: 0,
    testMode: false,
    debug: true
})