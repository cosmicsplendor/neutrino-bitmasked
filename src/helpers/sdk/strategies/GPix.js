export default class Gpix { // GamePix.com
    rva = true
    signalLoad() {
        return GamePix.loaded()
    }
    setOnPause(fn) {
        GamePix.pause = fn
    }
    setOnResume(fn) {
        GamePix.resume = fn
    }
    setLoadProg(val) {
        GamePix.loading(val)
    }
    playIntstAd() {
        return new Promise((resolve, reject) => {
            GamePix.interstitialAd().then(res => {
                if (res.success) {
                    resolve()
                }
                reject(res)
            }).catch(reject)
        })
    }
    playRva() {
        return new Promise((resolve, reject) => {
            GamePix.rewardAd().then(res => {
                if (res.success) {
                    resolve()
                }
                reject(res)
            }).catch(reject)
        })
    }
    prerollAd() {
        return Promise.reject()
    }
}