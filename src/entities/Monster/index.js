import BoneAnimNode from "@lib/entities/BoneAnimNode";
import { stateMachineMixin } from "@lib/utils/FSM";
import animData from "./anim.json"
import { fgLayerId, objLayerId } from "@lib/constants"
import deathAnimDat from "./death.json"
import bloodAnimDat from "../animDat/blood.json"
import getTestFn from "@lib/components/Collision/helpers/getTestFn";
import ParticleEmitter from "@lib/utils/ParticleEmitter";
import { Node } from "@lib/index";
import { circBounds, getGlobalPos } from "@lib/utils/entity";
import Bat from "../Bat"
import Collision from "@lib/components/Collision";
import { aabbCirc } from "@lib/utils/math";

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

  onEnter(bySpike) {
    this.monster.play("idle", "root state");
    this.timer = bySpike ? 1.25: 0;
    this.bySpike = bySpike
    if (bySpike) {
      this.monster.impalesfx.play()
    } else {
      this.monster.growl.play()
    }
  }
  update(dt) {
    this.monster.noOverlay = Math.random() < 0.5 ? true : false
    this.timer += dt;
    if (this.timer >= 1) {
      this.monster.remove()
      this.monster.deathsfx.play()
      const { x, y } = getGlobalPos(this.monster.syncroNode)
      const deathAnim = Monster.getDeathAnim()
      const bloodAnim = Monster.getBloodAnim()
      Node.get(objLayerId).add(bloodAnim)
      Node.get(objLayerId).add(deathAnim)
      if (!this.bySpike) {
        Node.get(objLayerId).add(new Bat({ x: x, y: y - 50, player: this.monster.player, soundSprite: this.monster.soundSprite }))
      } else {
        const { orbPool, player } = this.monster
        Node.get(fgLayerId).add(orbPool.create(x-24, y, null,  player ))
        Node.get(fgLayerId).add(orbPool.create(x+24, y, null,  player ))
        Node.get(fgLayerId).add(orbPool.create(x, y - 24, null,  player ))
      }
      bloodAnim.pos.x = x
      bloodAnim.pos.y = y - 60
      deathAnim.pos.x = x
      deathAnim.pos.y = y - 75

      if (this.monster.syncroNode.scale.x === -1) {
        bloodAnim.scale = { x: -1, y: 1 }
        deathAnim.scale = { x: -1, y: 1 }
      }
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
    const { x, y } = getGlobalPos(this.monster.syncroNode)
    const player = getGlobalPos(this.monster.player)
    if (player.x >  x && player.x < x + 320 && player.y < y + 48 && player.y > y - 140) {
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
    const { x, y } = getGlobalPos(this.monster.syncroNode)
    const player = getGlobalPos(this.monster.player)
    if (player.x < x && player.x > x - 320 && player.y < y + 48&& player.y > y - 160) {
        this.monster.switchState('runLeft');
    }
    // if (this.timer >= 3) {
    //   // this.monster.xOffset += 72
    // }
  }
}

class Monster extends BoneAnimNode {
  noOverlay = true
  bounds={ width: 80, height: 80 }
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
  constructor({ x, y, player, span = 200, orbPool, soundSprite }) {
    super({ data: animData, pos: { x: x + 136 * Math.sign(span), y } });
    this.player = player
    this.orbPool = orbPool
    this.soundSprite = soundSprite
    this.growl = soundSprite.create("growl")
    this.impalesfx = soundSprite.create("impale")
    this.deathsfx = soundSprite.create("mons_death")
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
    this.switchState(this.ogDir === 1 ? 'idleRight': "idleLeft");

    this.syncroNode.hitCirc = {
      x: -60, y: -30, radius: 45
    }
    this.testCol = getTestFn(this.syncroNode, this.player)
    this.mspikeCol = new Collision({ entity: this.syncroNode, blocks: "fspikes", rigid: false, movable: false, onHit: () => {
      this.switchState("glitch", true)
    } })
  }
  checkPlayerCol() {
    const { x, y } = getGlobalPos(this.syncroNode)
    this.bounds.x = x - 40
    this.bounds.y = y - 40
    if (aabbCirc(this.bounds, circBounds(this.player))) {
      this.switchState('glitch');
    }
  }
  update(dt, t) {
    // Update the current state
    const state = this.getState()
    if (state) state.update(dt);
    this.checkPlayerCol()
    this.mspikeCol.update()
    super.update(dt, t);
  }
}

export default Monster