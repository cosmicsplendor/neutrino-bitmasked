import styles from "./style.css"
export default (id) => {
    return `
        <div id="${id}" style="width: 44px; height:  12px;" >
            <div class="${styles.loadingDot} ${styles.dotA}"></div>
            <div class="${styles.loadingDot} ${styles.dotB}"></div>
            <div class="${styles.loadingDot} ${styles.dotC}"></div>
        </div>
    `
}