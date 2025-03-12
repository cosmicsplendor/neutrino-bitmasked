import { Node } from "@lib"
import TexRegion from "@lib/entities/TexRegion"
import { colRectsId, objLayerId, fgLayerId, mgLayerId } from "@lib/constants"
import { Rect } from "@lib/entities"
import config from "@config"

class TiledLevel extends Node {
    resetRecursively(node = this) {
        node.reset && node.reset()
        if (!node.children) return
        for (let child of node.children) {
            this.resetRecursively(child)
        }
    }
    constructor({ player, data, factories = {}, overlayMap = {}, hitboxMap={}, ...nodeProps }) {
        super({ ...nodeProps })
        let playerAdded = false
        const colRects = new Node({ id: colRectsId }) // collision rects are invisible, so wherever in the scene graph they go doesn't matter
        const objNode = new Node({ id: objLayerId }) // node for entities created via factories; it goes between world layer and foreground
        const mgObjNode = new Node({ id: mgLayerId }) // midground tile-group that lies behind the world layer
        const fgObjNode = new Node({ id: fgLayerId }) // foreground tile-group that lies in front of the world layer
        const objNodeMap = {
            mg: mgObjNode,
            world: objNode,
            fg: fgObjNode
        }
        const getGroup = function (id) { // all the collision groups in particular node should go to it's respective objLayer
            const g = Node.get(id)
            if (!g) { // if g isn't there, create a new one, add it to the objNode and return it
                const newG = new Node({ id })
                this.add(newG)
                return newG
            }
            return g
        }
        objNode.getGroup = getGroup
        mgObjNode.getGroup = getGroup
        fgObjNode.getGroup = getGroup
        const addTiles = (tiles, layer) => {
            const objNode = objNodeMap[layer]
            const addTile = ({ name, x, y, groupId, ...props }) => {
                const factory = factories[name]
                if (factory) { // in case there exists a factory for creating the tile with this particular name, give that a precedence
                    const parentNode = !!groupId ? objNode.getGroup(groupId) : objNode
                    parentNode.add(factory(x, y, props, player))
                    return
                }
                const region = new TexRegion({ frame: name, overlay: overlayMap[name], pos: { x: x, y: y } })

                const parentNode = groupId ? objNode.getGroup(groupId) : this
                parentNode.add(region)
            }
            const t = tiles
            t.forEach(addTile)
        }

        const addSpawnPoint = ({ x, y, groupId, layer = "w", ...props }) => {
            const name = props.name
            if (name === "player" && props.temp && !config.testMode) return // prop.temp means it's a player only used during design for camera focus - should be skipped in prod mode (!config.testMode)
            if (name === "player" && config.testMode && !props.temp) return // just allow temp player to be added during design
            if (name === "player" && playerAdded) return // disallow multiple instances of players

            if (name === "player") playerAdded = true
            const factory = factories[name]
            const ent = typeof factory === "function" ? factory(x, y, props, player) : new TexRegion({ pos: { x, y }, frame: name, overlay: overlayMap[name] })
            if (props.flipX) {
                ent.pos.x += ent.width
                ent.scale = { x: -1, y: 1 }
            }
            if (hitboxMap[name]) {
                ent.hitbox = hitboxMap[name]
            }
            const node = layer === "mg" ? mgObjNode :
                layer === "fg" ? fgObjNode :
                    objNode
            const parentNode = !!groupId ? node.getGroup(groupId) : node
            parentNode.add(ent)
        }
        const wallTiles = []
        const addColRect = ({ x, y, width, height, reconstr, ...props }) => {
            const colRect = new Node({ pos: { x, y } })
            colRect.width = width
            colRect.height = height
            Object.assign(colRect, props)
            colRects.add(colRect)
            if (reconstr) {
                const w = height/48
                const h = width / 48
                for (let i = 0; i < w; i++) {
                    for (let j = 0; j < h; j++) {
                        const tileX = x + j * 48
                        const tileY = y + i * 48
                        wallTiles.push({ x: tileX, y: tileY, name: "wt_1"})
                    }
                }
            }
        }

        // adding col-rects to objNode (after world tiles and before world spawn points)
        data.collisionRects.forEach(addColRect)

        // followed by midground tiles and mgObjNode
        addTiles(data.mgTiles, "mg")
        this.add(mgObjNode)

        // then, world-layer tiles, objNode and spawnPoints (all of which lie on world layer)
        addTiles(data.tiles, "world")
        this.add(objNode)
        data.spawnPoints.forEach(addSpawnPoint)

        // and finally foreground tiles and fgObjNode
        addTiles(data.fgTiles, "fg")
        addTiles(wallTiles, "fg")
        this.add(fgObjNode)
        this.add(colRects)

        this.width = data.width
        this.height = data.height

        if (!config.testMode) return
        const checkpoints = data.tempSpawnPoints.filter(p => p.name === "checkpoint").concat(data.checkpoints)

        checkpoints.forEach(p => {
            fgObjNode.add(new TexRegion({ frame: "wtr_g", pos: { x: p.x, y: p.y }, scale: { x: 1.34, y: 1.34 }, alpha: 1 }))
        })
        data.tempSpawnPoints.forEach(p => {
            if (p.name === "checkpoint") {
                return
            }
            addSpawnPoint(p)
        })
        if (Array.isArray(data.previewColRects)) {
            data.previewColRects.forEach(({ x, y, w, h }) => {
                for (let i = 0; i < w; i++) {
                    for (let j = 0; j < h; j++) {
                        const rect = new TexRegion({ pos: { x: (x + i) * 48, y: (y + j) * 48 }, frame: "wtr_g", alpha: 0.3 })
                        rect.overlay = [1, 1, 0]
                        fgObjNode.add(rect)
                    }
                }
            })
        }
        if (!config.debug) return
        data.collisionRects.forEach(({ x, y, width, height }) => {
            fgObjNode.add(new Rect({ width, height, pos: { x, y }, alpha: 0.6, fill: "#aaa" }))
        })
    }
}

export default TiledLevel