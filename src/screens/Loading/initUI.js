import config from "@config"
import UI from "@lib/utils/UI"
import { calcAligned, calcStacked } from "@utils/entity"
import { offlineErrMsg } from "@lib/constants"
import styles from "./style.css"

const progBarDims = {
    width: 150,
    height: 25
}

const INFO = "info"
const MSG = "msg"
const PROG_BAR = "prog-bar"
const PROG_IND = "prog-ind"
const progressBar = (width, height, barId, indId) => {
    return `
        <div id="${barId}" class="${styles.bar}" style="width: ${width}px; height: ${height}px; background: #ffe6d5; z-index: 99999;">
        </div>
        <div id="${indId}" class="${styles.bar}" style="width: 4px; height: ${height}px; background: tomato; z-index: 100000;">
        </div>
    `
}

const render = (barId, indId, infoId, msgId) => {
   return `
        ${progressBar(progBarDims.width, progBarDims.height, PROG_BAR, PROG_IND, barId, indId)}
        <div id="${infoId}" class="${styles.txt} ${styles.info}"></div>
        <div id="${msgId}" class="${styles.txt} ${styles.info}"></div>
    `
}

const initUI = (uiRoot) => {
    uiRoot.content = render(PROG_BAR, PROG_IND, INFO, MSG)
    const progBar = uiRoot.get(`#${PROG_BAR}`)
    const progInd = uiRoot.get(`#${PROG_IND}`)
    const info = uiRoot.get(`#${INFO}`)
    const msg = uiRoot.get(`#${MSG}`)
    const realign = viewport => { 
        progBar.pos = calcAligned(viewport, progBarDims, "center", "center")
        progInd.pos = calcAligned(viewport, progBarDims, "center", "center",)
        info.pos = calcStacked(progBar, UI.bounds(info), "bottom", 0, 20)
        msg.pos = calcStacked(progBar, UI.bounds(msg), "bottom", 0, 50)
    }
    config.viewport.on("change", realign)
    realign(config.viewport)
    return {
        teardown: () => {
            config.viewport.off("change", realign)
            uiRoot.clear()
        },
        onProg: (p, message) => {
            progInd.domNode.style.width = `${Math.round(p * progBarDims.width)}px`
            info.content = `${Math.round(p * 100)}%`
            msg.content = message
            realign(config.viewport)
        },
        onError: e => {
            console.log(e)  
            info.content = !!e && e.message === offlineErrMsg ? "Error: something went wrong": "Error: Unsupported Device"
            info.domNode.style.color = "#d34545"
            msg.content = ""
            realign(config.viewport)
        },
        onLoad: () => {
            uiRoot.clear()
        }
    }
}

export default initUI