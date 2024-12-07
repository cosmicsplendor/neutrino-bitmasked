import UI from "@utils/UI"
import config from "@config"
import styles from "./style.css"
const scale = config.isMobile? 0.6: 1

export const dom = (img, class_) => {
    const el = UI.create("div")
    el.domNode.setAttribute("class", `${styles.imgBtn} ${class_ || ''}`)
    el.domNode.setAttribute("style", `width: ${img.width * scale}px; height: ${img.height * scale}px; background: url(${img.src}); object-size: cover; background-size: cover !important;`)
    el.width = img.width
    el.height = img.height
    return el
}
export default (id, img, class_) => {
    return `
    <div 
        class="${styles.imgBtn} ${class_ || ''}" 
        id="${id}" 
        style="width: ${img.width * scale}px; height: ${img.height * scale}px; background: url(${img.src}); background-size: contain !important;"
    >
    </div>
    `
}