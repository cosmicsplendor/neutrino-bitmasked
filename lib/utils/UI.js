class UI {
    static query(q, root) {
        return new UI(null, q, root)
    }
    static create(el) {
        return new UI(document.createElement(el))
    }
    static bounds(el) {
        return el.domNode.getBoundingClientRect()
    }
    _baseOpacity=1
    constructor(domNode, query, root = document) {
        this.domNode = domNode || root.querySelector(query)
        if (!this.domNode) {
            throw new Error("one or more invalid constructor parameters")
        }
        if (!this.domNode.getBoundingClientRect) {
            return
        }
        this.x = 0
        this.y = 0
        if (!!domNode) { return }
        const { width, height } = this.domNode.getBoundingClientRect()
        this.width = width
        this.height = height
    }
    set baseOpacity(val) {
        this._baseOpacity=val
    }
    get(query) {
        return UI.query(query, this.domNode)
    }
    hide(force) {
        this.domNode.style.opacity = 0
        if (force)  this.domNode.style.display = "none"
    }
    show(force) {
        this.domNode.style.opacity = this._baseOpacity ?? 1
        if (force)  this.domNode.style.display = "block"
    }
    get classList() {
        return this.domNode.classList
    }
    set pos({ x, y }) {
        if (x) { 
            this.x = x
            this.domNode.style.left = `${x}px`
        }
        if (y) {
            this.y = y
            this.domNode.style.top = `${y}px`
        }
    }
    set content(html) {
        this.domNode.innerHTML = html
    }
    clear() {
        this.content = ""
    }
    on(event, callback) {
        this.domNode.addEventListener(event, callback)
    }
    off(event, callback) {
        this.domNode.removeEventListener(event, callback)
    }
    add(el) {
        this.domNode.appendChild(el.domNode || el)
        return this
    }
}

export default UI