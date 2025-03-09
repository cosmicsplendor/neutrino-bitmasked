import BoneAnimNode from "@lib/entities/BoneAnimNode";
import { stateMachineMixin } from "@lib/utils/FSM";
import animData from "./anim.json"
import { objLayerId } from "@lib/constants"
import deathAnimDat from "./death.json"
import bloodAnimDat from "./blood.json"
import getTestFn from "@lib/components/Collision/helpers/getTestFn";
import ParticleEmitter from "@lib/utils/ParticleEmitter";
import { Node } from "@lib/index";
import { getGlobalPos } from "@lib/utils/entity";
import Bat from "./Bat"

// Define state classes
class RunRight {
  constructor(monster) {
    this.monster = monster;
    this.name = 'runRight';
  }

  onEnter() {
    this.monster.play("run2", "run1");
    this.monster.syncroNode.scale.x = 1;
  }

  update(dt) {
    const sw = this.monster.ogDir === 1 ? this.monster.syncroNode.pos.x > this.monster.span : this.monster.syncroNode.pos.x >75
    if (sw) {
      if (this.monster.ogDir === 1) {
        this.monster.switchState('idleRight', "runLeft");
      } else {
        this.monster.switchState('idleRight', 'idleLeft');
      }
    }
  }
}
// Define state classes
class Glitch {
  constructor(monster) {
    this.monster = monster;
    this.name = 'glitch';
  }

  onEnter() {
    this.monster.play("idle", "root state");
    this.timer = 0;
  }

  update(dt) {
    this.monster.noOverlay = Math.random() < 0.5 ? true : false
    this.timer += dt;
    // const delPosX = getGlobalPos( this.monster.syncroNode).x + 50 * this.monster.syncroNode.scale.x - this.monster.player.pos.x
    // this.monster.player.pos.x += delPosX * 0.05
    if (this.timer >= 1) {
      this.monster.remove()
      const { x, y } = getGlobalPos(this.monster.syncroNode)
      const deathAnim = Monster.getDeathAnim()
      const bloodAnim = Monster.getBloodAnim()
      Node.get(objLayerId).add(bloodAnim)
      Node.get(objLayerId).add(deathAnim)
      for (let i = 0; i < 8; i++) {
        const bat = new Bat(x, y - 50, this.monster.player)
        Node.get(objLayerId).add(bat)
      }
      bloodAnim.pos.x = x
      bloodAnim.pos.y = y - 60
      deathAnim.pos.x = x
      deathAnim.pos.y = y - 75
    }
  }
}

class IdleRight {
  constructor(monster) {
    this.monster = monster;
    this.name = 'idleRight';
  }

  onEnter(transition = "") {
    this.monster.play("idle", "root state");
    this.timer = 0;
    this.transition = transition
    this.monster.syncroNode.scale.x = 1
  }

  update(dt) {
    this.timer += dt;
    if (this.transition) {
      this.monster.syncroNode.scale.x -= dt * 8
      if (this.timer > .25) {
        if (this.transition === "runLeft") {
          this.monster.xOffset += 16
        }
        this.monster.switchState(this.transition);
      }
      return
    }
    if (this.timer >= 3) {
      // this.monster.xOffset -= 56
      this.monster.switchState('runRight');
    }
  }
}

class RunLeft {
  constructor(monster) {
    this.monster = monster;
    this.name = 'runLeft';
  }

  onEnter() {
    this.monster.play("run2", "run1");
    this.monster.syncroNode.scale.x = -1;
  }

  update(dt) {
    const sw = this.monster.ogDir === 1 ? this.monster.syncroNode.pos.x < -50: this.monster.syncroNode.pos.x < this.monster.span
    if (sw) {
      if (this.monster.ogDir === 1) {
        this.monster.switchState('idleLeft', "idleRight");
      } else {
        this.monster.switchState('idleLeft', 'runRight')
      }
    }
  }

  onExit() {
    // Optional cleanup
  }
}

class IdleLeft {
  constructor(monster) {
    this.monster = monster;
    this.name = 'idleLeft';
  }

  onEnter(transition = "") {
    this.monster.play("idle", "root state");
    this.timer = 0;
    this.transition = transition
    this.monster.syncroNode.scale.x = -1;
  }

  update(dt) {
    this.timer += dt;
    if (this.transition) {
      this.monster.syncroNode.scale.x += dt * 8
      if (this.timer > 0.25) {
        if (this.transition === "idleRight") {
          this.monster.xOffset -= 16
        }
        this.monster.switchState(this.transition);
      }
      return
    }
    if (this.timer >= 3) {
      // this.monster.xOffset += 72
      this.monster.switchState('runLeft');
    }
  }
}

class Monster extends BoneAnimNode {
  noOverlay = true
  static getDeathAnim() {
    if (this.deathAnim instanceof ParticleEmitter) return this.deathAnim
    this.deathAnim = new ParticleEmitter(deathAnimDat)
    this.deathAnim.noOverlay = true
    // this.deathAnim.overlay = [1,0,0]
    return this.deathAnim
  }
  static getBloodAnim() {
    if (this.bloodAnim instanceof ParticleEmitter) return this.bloodAnim
    this.bloodAnim = new ParticleEmitter(bloodAnimDat)
    this.bloodAnim.noOverlay = true
    return this.bloodAnim
  }
  constructor({ x, y, player, span = 200 }) {
    super({ data: animData, pos: { x: x + 136 * Math.sign(span), y } });
    this.player = player
    this.syncroNode.scale.x = 1
    this.span = span
    this.syncroNode.pos.x = 0
    this.ogDir = Math.sign(span)
    // Create state instances
    const states = {
      runRight: new RunRight(this),
      idleRight: new IdleRight(this),
      runLeft: new RunLeft(this),
      idleLeft: new IdleLeft(this),
      glitch: new Glitch(this)
    };

    // Apply the state machine mixin
    stateMachineMixin(this, states);
    // this.switchState(this.ogDir === 1 ? 'idleRight': "idleLeft");
    this.switchState("runLeft")

    this.syncroNode.hitCirc = {
      x: -60, y: 0, radius: 100
    }
    this.testCol = getTestFn(this.syncroNode, this.player)
  }

  update(dt, t) {
    // Update the current state
    const state = this.getState()
    if (state) state.update(dt);
    // Call the parent update method
    // this.player.pos.x = Math.round(getGlobalPos(this.syncroNode).x)
    // Object.assign(this.player.pos, getGlobalPos(this.syncroNode))
    if (this.testCol(this.syncroNode, this.player)) {
      // glitch
      // this.noOverlay = Math.random() < 0.5
      // this.switchState('glitch');
    }

    super.update(dt, t);
  }
}

export default Monster