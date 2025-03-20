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
class Run {
  bounds = { width: 140, height: 96 }
  constructor(monster) {
    this.monster = monster;
    this.name = 'run';
    this.spikeCol = new Collision({
      entity: this.monster.syncroNode, blocks: "spikes", rigid: false, movable: false, onHit: () => {
        this.die()
      }
    })
  }
  onEnter() {
    this.monster.play("run", "run2");
    this.monster.syncroNode.scale.x = 1;
    this.player = this.monster.player
  }
  die() {
  }
  checkPlayerCol() {
    const { x, y } = getGlobalPos(this.monster.syncroNode)
    this.bounds.x = x - 48
    this.bounds.y = y - 48
    if (aabbCirc(this.bounds, circBounds(this.player))) {
      this.monster.switchState('idle', true);
      this.player.explode()
    }
  }
  update() {
    this.checkPlayerCol()
    this.spikeCol.update()
  }
}

class Idle {
  lookAhead=300
  constructor(monster) {
    this.monster = monster;
    this.name = 'idle';
  }
  onEnter(playerDead) {
    this.playerDead = playerDead
    this.monster.play("idle", "root state");
    this.dir = this.monster.dir
    this.player = this.monster.player
    this.monster.syncroNode.scale.x = this.dir
  }
  update() {
    if (this.playerDead) return
    const { x, y } = getGlobalPos(this.monster.syncroNode)
    const player = getGlobalPos(this.player)
    if (player.x > x - this.dir * 56 && player.x < x + this.lookAhead * this.dir && player.y < y + 48 && player.y > y - 100) {
      this.monster.switchState('run');
    }
  }
}


class Boar extends BoneAnimNode {
  noOverlay = true
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
      run: new Run(this),
      idle: new Idle(this),
    };

    stateMachineMixin(this, states);
    this.switchState('idle');

    // this.syncroNode.hitCirc = {
    //   x: -60, y: -30, radius: 45
    // }
    // this.testCol = getTestFn(this.syncroNode, this.player)
  }
  update(dt, t) {
    const state = this.getState()
    if (state) state.update(dt);
    super.update(dt, t);
  }
}

export default Boar