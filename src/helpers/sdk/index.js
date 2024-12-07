class SDK {
    periodBetweenAds = 45 * 1000
    adLastPlayedAt = Date.now() - 45 * 1000
    constructor(strategy) {
        this.strat = strategy
    }
    rvaSupported() {
        if (!this.strat) return false
        return this.strat.rva
    }
    setLoadProg(val) {
        if (!this.strat) return
        this.strat.setLoadProg(val)
    }
    signalLoad() {
        if (!this.strat) return Promise.resolve()
        return this.strat.signalLoad()
    }
    playRva() {
        if (!this.strat) return Promise.reject()
        this.adLastPlayedAt = Date.now()
        return this.strat.playRva()
    }
    canPlay() {
        return Date.now() - this.adLastPlayedAt < this.periodBetweenAds
    }
    playIntstAd() {
        if (!this.strat || this.canPlay()) {
            console.log("Ad throttled: interstitial ad frequency exceeded")
            return Promise.reject()
        }
        this.adLastPlayedAt = Date.now()
        return this.strat.playIntstAd()
    }
    prerollAd() {
        if (!this.strat) return Promise.reject()
        this.adLastPlayedAt = Date.now()
        return this.strat.prerollAd()
    }
    setOnPause(fn) {
        if (!this.strat) return
        this.strat.setOnPause(fn)
    }
    setOnResume(fn) {
        if (!this.strat) return
        this.strat.setOnResume(fn)
    }
}

export default SDK