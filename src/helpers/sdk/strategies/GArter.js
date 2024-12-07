export default class GArter { // GameArter.com (published at PacoGames.com)
    rva = true
    ready = false // internal state
    onPause = null
    onResume = null
    constructor() {
        this.sdkInstance = new GamearterInstance({
            projectId: 	11007, // Insert your project id here 
            projectVersion: 1, // Insert your project version here
            sdkMode: "B", // Use SDK in Basic mode
            sdkVersion: "2.0" // use SDK ver 2.0
        })
        this.sdkInstance.I.AddExternalCbListener("SdkInitialized", () => {
            this.ready = true
        })
        this.generateCallback = (resolve, reject) => adState => {
            console.log(adState)
            switch(adState) {
                case "loaded":
                    this.onPause && this.onPause()
                break
                case "completed":
                    this.onResume && this.onResume()
                    resolve()
                break
                case  "failed":
                    this.onResume && this.onResume()
                    reject()
                break
                case "ignored":
                    this.onResume && this.onResume()
                    reject()
                break
            }
        }
    }
    signalLoad() {
        return Promise.resolve()
    }
    setOnPause(fn) {
        this.onPause = fn
    }
    setOnResume(fn) {
        this.onResume = fn
    }
    setLoadProg() { }
    playIntstAd() {
        if (!this.ready) return Promise.reject()

        return new Promise((resolve, reject) => {
            const callback = this.generateCallback(resolve, reject)
            this.sdkInstance.I.CallAd("midroll", callback)
        })
    }
    playRva() {
        if (!this.ready) return Promise.reject()

        return new Promise((resolve, reject) => {
            const callback = this.generateCallback(resolve, reject)
            this.sdkInstance.I.CallAd("rewarded", callback)
        })
    }
    prerollAd() {
        if (!this.ready) return Promise.reject()

        return new Promise((resolve, reject) => {
            const callback = this.generateCallback(resolve, reject)
            this.sdkInstance.I.CallAd("preroll", callback)
        })
    }
}