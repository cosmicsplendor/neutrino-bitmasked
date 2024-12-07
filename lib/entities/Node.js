class Node {
    static __entities = { }
    static addRef(id, node) {
        this.__entities[id] = node
    }
    static removeRef(id) { 
        this.__entities[id] = null
    }
    static get(id) {
        return this.__entities[id]
    }
    static cleanupRecursively(node) {
        if (node.onRemove) { node.onRemove() }
        if (node.id) { this.removeRef(node.id) }
        if (!node.children) { return }
        for (let childNode of node.children) {
            Node.cleanupRecursively(childNode)
        }
    }
    static updateRecursively(node, dt, t, rootNode = node) {
        if (node.movable) {
            node.prevPosX = node.pos.x
            node.prevPosY = node.pos.y
            if (node.unduePosXUpdate) {
                node.pos.x += node.unduePosXUpdate
                node.unduePosXUpdate = 0
            }
            if (node.roll) {
                node.prevRot = node.rotation
            }
        }
        node._visible = node.alpha === 0 ? false: (rootNode.intersects ? rootNode.intersects(node): true)
        ;(node._visible || node.forceUpdate) && node.update && node.update(dt, t)
        if (!node.children) { return }
        const cachedChildren = node.children
        /**
         * cached copy of node.children must be kept to ensure the code executes predictable
         * in case we didn't do so, removal of a childNode (in it's update function) would break this recursion --
         * when the children iteration reaches the removed childNode's last sibling
         * that's because the new children array would have lastChildrenLength - 1 length, but the endpoint of the current iteration -- 
         * would still be lastChildrenLength. So trying access length index of the new children array would result in an undefined value
         * Here's an interesting fact: this shrinking of children array results in the removed node's next sibling shifting an index backward,
         * thus occupying the removed node's current position. The next iteration therefore skips over it.
         */
        for (let i = 0, len = cachedChildren.length; i < len; i++) {
            Node.updateRecursively(cachedChildren[i], dt, t, rootNode)
        }
    }
    static removeChild(parentNode, childNode, cleanup = true) {
        if (!parentNode) { return }
        parentNode.children = parentNode.children.filter(n => n !== childNode)
        childNode.parent = null
        if (cleanup) this.cleanupRecursively(childNode)
    }
    constructor({ pos = { x: 0, y: 0 }, rotation, scale,  anchor, pivot, id, alpha } = {}) {
        this.pos = pos
        this._visible = true
        scale && (this.scale = scale)
        rotation && (this.rotation = rotation)
        anchor && (this.anchor = anchor)
        pivot && (this.pivot = pivot)
        alpha && (this.alpha = alpha)
        if (Boolean(id)) {
            this.id = id
            Node.addRef(id, this)
        }
    }
    add(childNode) { // presence or absense of children field indicates whether a node is a leaf node
        childNode.parent = this
        if (this.children) {
            this.children.push(childNode)
            return
        }
        this.children = [ childNode ]
    }
    remove(cleanup) {
        Node.removeChild(this.parent, this, cleanup)
    }
}

export default Node