import { dom as domImgBtn } from "@screens/ui/imgBtn"
import styles from "./style.css"
export default (storage, getterKey, setterKey, gameState, onImg, offImg, sound, webAudioSupported, title) => {
    const img = !!storage[getterKey]() ? onImg: offImg
    const _class = webAudioSupported ? styles.hidden: styles.dead
    const el = domImgBtn(img, _class, title)
    el.on("click", () => {
        if (!gameState.is("playing")) return
        const musicOn = !storage[getterKey]()
        storage[setterKey](musicOn)
        el.domNode.style.background = `url(${musicOn ? onImg.src: offImg.src})`
        el.domNode.style.backgroundSize = "contain"
        sound.play()
    })
    return el
}