import BoneAnimNode from "@lib/entities/BoneAnimNode";
import { stateMachineMixin } from "@lib/utils/FSM";
import animData from "./anim.json"
import { fgLayerId, objLayerId } from "@lib/constants"
import getTestFn from "@lib/components/Collision/helpers/getTestFn";
import ParticleEmitter from "@lib/utils/ParticleEmitter";
import { Node } from "@lib/index";
import { circBounds, getGlobalPos } from "@lib/utils/entity";
import Collision from "@lib/components/Collision";
import { aabbCirc } from "@lib/utils/math";

// Define state classes
class RunRight {
  constructor(monster) {
    this.monster = monster;
    this.name = 'runRight';
  }

  onEnter() {
    this.monster.play("run", "run2");
    this.monster.syncroNode.scale.x = 1;
  }

  update(dt) {
    // const sw = this.monster.dir === 1 ? this.monster.syncroNode.pos.x > this.monster.span : this.monster.syncroNode.pos.x >75
    // if (sw) {
    //   if (this.monster.dir === 1) {
    //     this.monster.switchState('idleRight', "runLeft");
    //   } else {
    //     this.monster.switchState('idleRight', 'idleLeft');
    //   }
    // }
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
    if (player.x > x && player.x < x + 320 && player.y < y + 48 && player.y > y - 140) {
      this.monster.switchState('runRight');
    }
  }
}


class Boar extends BoneAnimNode {
  noOverlay = true
  bounds = { width: 80, height: 80 }
  //   static getDeathAnim() {
  //     if (this.deathAnim instanceof ParticleEmitter) return this.deathAnim
  //     this.deathAnim = new ParticleEmitter(deathAnimDat)
  //     this.deathAnim.noOverlay = true
  //     // this.deathAnim.overlay = [1,0,0]
  //     return this.deathAnim
  //   }
  //   static getBloodAnim() {
  //     if (this.bloodAnim instanceof ParticleEmitter) return this.bloodAnim
  //     this.bloodAnim = new ParticleEmitter(bloodAnimDat)
  //     this.bloodAnim.noOverlay = true
  //     return this.bloodAnim
  //   }
  constructor({ x, y, player, dir = 1, orbPool, soundSprite }) {
    super({ data: animData, pos: { x: x + 136 * Math.sign(dir), y } });
    this.player = player
    this.orbPool = orbPool
    this.soundSprite = soundSprite
    // this.growl = soundSprite.create("growl")
    // this.impalesfx = soundSprite.create("impale")
    // this.deathsfx = soundSprite.create("mons_death")
    this.syncroNode.scale.x = 1
    this.span = Math.sign(dir)
    this.syncroNode.pos.x = 0
    this.dir = dir
    // Create state instances
    const states = {
      runRight: new RunRight(this),
      idleRight: new IdleRight(this),
    };

    // Apply the state machine mixin
    stateMachineMixin(this, states);
    this.switchState('runRight');

    this.syncroNode.hitCirc = {
      x: -60, y: -30, radius: 45
    }
    this.testCol = getTestFn(this.syncroNode, this.player)
    this.mspikeCol = new Collision({
      entity: this.syncroNode, blocks: "fspikes", rigid: false, movable: false, onHit: () => {
        this.switchState("glitch", true)
      }
    })
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
    // this.checkPlayerCol()
    // this.mspikeCol.update()
    super.update(dt, t);
  }
}

export default Boar