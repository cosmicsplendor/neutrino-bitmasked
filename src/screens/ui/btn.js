import styles from "./style.css"
export default (id, content) => {
    return `
        <div id="${id}" class="${styles.playBtn}">${content}</div>
    `
}