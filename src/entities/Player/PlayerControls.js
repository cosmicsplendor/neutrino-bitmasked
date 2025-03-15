import KeyControls from "@lib/components/controls/KeyControls"
import TouchControls from "@lib/components/controls/TouchControls"
import { clamp } from "@utils/math"

const extendPalyerControls = S => class extends S {
    stateSwitched = false // a helper flag for preventing multiple state updates every frame making sure the first one gets the precendence 
    constructor(speed=100, mappings, onJump=() => {}, gameState) {
        super(mappings)
        this.gameState = gameState
        this.speed = speed
        this.states = {
            offEdge: new OffEdge(this),
            jumping: new Jumping(this, onJump),
            rolling: new Rolling(this),
        }
        this.state = this.states.jumping
        this.state.limitReached = true
    }
    cleanup() {
        this.reset() // reset pressed attribute on all keys
        this.stateSwitched = false // reset stateSwitched for the next frame
    }
    switchState(name, ...params) {
        if (this.stateSwitched || name === this.state.name) { return } // disallow state switching more than once every frame
        this.state.onExit && this.state.onExit() // execute previous state's onExit hook, in case there's one
        this.state = this.states[name]
        this.state.onEnter && this.state.onEnter(...params)
        this.stateSwitched = true
    }
    update(entity, dt) {
        if (!this.gameState.is("playing")) return
        this.state.update(entity, dt)
        this.cleanup()
    }
}


class Rolling {
    name = "rolling"
    constructor(controls) {
        this.controls = controls
    }
    onEnter() {
    }
    update(entity, dt) {
        if (this.controls.get("left")) {
            entity.velX -= (entity.velX > 0 ? 3 : 1) * this.controls.speed * dt * entity.invWeight;
        } else if (this.controls.get("right")) {
            entity.velX += (entity.velX < 0 ? 3 : 1) * this.controls.speed * dt * entity.invWeight;
        } else {
            // If no left or right control is held, apply additional friction
            Math.abs(entity.velX) < 10 && (entity.velX =  0); // Adjust this factor as needed
        }
        if (this.controls.get("axn")) {
            this.controls.switchState("jumping", entity)
        }
    }
}

class Jumping {
    name = "jumping"
    jmpVel = -260
    maxJvelInc = 5.5
    minJmpVel = -375
    mxJmpVel = 150
    first = false // whether it is the first frame since last
    constructor(controls, onJump) {
        this.controls = controls
        this.onJump = onJump
    }
    onEnter(entity, limReached=false, playJumpSound=true) {
        if (limReached || entity.velY > this.mxJmpVel) { 
            // if jump state begins from peak height (like when falling off the edge of a wall)
            // or if the player is not fast enough to press jump after floor underneath has collapsed
            // no more height can be gained
            this.limitReached = true
            return
        }
        this.limitReached = false
        entity.velY += this.jmpVel * entity.invWeight
        if (entity.velY < 0 && playJumpSound) { // if the jump is actually possible (there's nothing above blocking the player) and the player isn't falling down
            this.onJump()
        }
    }
    onHalt() { // obstruct jump prematurely (mostly by collision with bottom edge of a rect)
        this.limitReached = true
    }
    update(entity, dt) {
        if (this.controls.get("left")) {
            entity.velX -= (entity.velX > 0 ? 3 : 1) * this.controls.speed * dt * entity.invWeight
        }
        if (this.controls.get("right")) {
            entity.velX += (entity.velX < 0 ? 3 : 1) * this.controls.speed * dt  * entity.invWeight
        }
        if (this.controls.get("axn")) {
            if (entity.velY < this.minJmpVel || entity.velY > this.mxJmpVel * entity.invWeight) { this.limitReached = true }
            if (this.limitReached) { return }
            entity.velY += this.jmpVel * entity.invWeight * ( Math.min(this.maxJvelInc, (entity.velY * entity.velY) / 100)) * dt 
        } else { this.limitReached = true } // if the player has stopped pressing "axn" key, player won't gain anymore velocity in this jump
    }
}

class OffEdge {
    name = "offEdge"
    constructor(controls) {
        this.controls = controls
    }
    update(entity, dt) {
        if (this.controls.get("left")) { // off the right edge
            entity.velX -= this.controls.speed * dt
        }
        if (this.controls.get("right")) { // off the left edge 
            entity.velX += this.controls.speed * dt
        }
        if (this.controls.get("axn")) {
            this.controls.switchState("jumping", entity)
            entity._offEdge = 0
        }
        entity.velX = clamp(-100, 100, entity.velX) 
    }
}

export const PlayerKeyControls = extendPalyerControls(KeyControls)
export const PlayerTouchControls = extendPalyerControls(TouchControls)