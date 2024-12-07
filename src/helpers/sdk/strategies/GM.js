export default class GM { // GameMonetize.com
    rva = false
    ready = false
    onPause = null
    onResume = null
    onAdEnd = null
    gameId = "ng1cndnhqyt5r986yphveujeapfk5sca"
    constructor() {
        window.SDK_OPTIONS = {
            gameId: this.gameId,
            onEvent: a => {
                switch (a.name) {
                    case "SDK_GAME_PAUSE":
                        // pause game logic / mute audio
                        this.onPause && this.onPause()
                    break
                    case "SDK_GAME_START":
                        // advertisement done, resume game logic and unmute audio
                        this.onResume && this.onResume()
                        this.onAdEnd && this.onAdEnd()
                    break
                    case "SDK_READY":
                        // when sdk is ready
                        this.ready = true
                    break
                }
            }
        }
        ;(function (a, b, c) { // inject the sdk script
            var d = a.getElementsByTagName(b)[0];
            a.getElementById(c) || (a = a.createElement(b), a.id = c, a.src = "https://api.gamemonetize.com/sdk.js", d.parentNode.insertBefore(a, d))
        })(document, "script", "gamemonetize-sdk")
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
    setLoadProg() {
    }
    playIntstAd() {
        if (typeof sdk === 'undefined' || sdk.showBanner === 'undefined' || this.ready === false) {
            return Promise.resolve()
        }
        return new Promise((resolve, reject) => {
            try {
                sdk.showBanner()
                this.onAdEnd = () => {
                    resolve()
                    this.onAdEnd = null
                }
            } catch(e) {
                reject(e)
                this.onAdEnd = null
            }
        })
    }
    playRva() { 
        // doesn't support rva
        return this.playIntstAd()
    }
    prerollAd() {
        return this.playIntstAd()
    }
}