import Sound from "@utils/Sound"
import { offlineErrMsg } from "@lib/constants"

const loadSoundResource = Sound.loadResource
const loadImgResource = url => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = () => resolve(img)
        img.onerror = () => reject({ message: offlineErrMsg })
    })
}
const loadDataResource = url => {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(res => res.json())
            .then(data => resolve(data))
            .catch(e => reject({ message: offlineErrMsg }))
    })
}
const types = Object.freeze({ SOUND: "SOUND", IMAGE: "IMAGE", DATA: "DATA" })


const loadFns = {
    [types.SOUND]: loadSoundResource,
    [types.IMAGE]: loadImgResource,
    [types.DATA]:loadDataResource
}

const inferType = url => {
    if (url.match(/.(jpe?g)|(png)$/)) {
        return types.IMAGE
    } else if (url.match(/.(mp3)|(wav)|(ogg)$/)) {
        return types.SOUND
    } else if (url.match(/.(cson|bson)$/)) {
        return types.DATA
    }
}

const loadResource = url => {
    const type = inferType(url)
    const load = loadFns[type]
    return load(url)
}

export default loadResource