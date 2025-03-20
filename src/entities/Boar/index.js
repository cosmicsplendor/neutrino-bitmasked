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
import bloodAnimDat from "../animDat/blood.json"


// Define state classes
class Run {
  bounds = { width: 140, height: 96 }
  constructor(boar) {
    this.boar = boar;
    this.name = 'run';
    this.spikeCol = new Collision({
      entity: this.boar.syncroNode, blocks: "spikes", rigid: false, movable: false, onHit: () => {
        this.die()
      }
    })
  }
  onEnter() {
    this.boar.noOverlay = true
    this.boar.play("run", "run2");
    this.boar.syncroNode.scale.x = 1;
    this.player = this.boar.player
  }
  die() {
    const bloodAnim = Boar.getBloodAnim()
    Node.get(objLayerId).add(bloodAnim)
  }
  checkPlayerCol() {
    const { x, y } = getGlobalPos(this.boar.syncroNode)
    this.bounds.x = x - 48
    this.bounds.y = y - 28
    if (aabbCirc(this.bounds, circBounds(this.player))) {
      this.boar.switchState('idle', true);
      this.player.explode()
    }
  }
  update() {
    this.checkPlayerCol()
    this.spikeCol.update()
  }
}

class Idle {
  lookAhead = 320
  constructor(boar) {
    this.boar = boar;
    this.name = 'idle';
  }
  onEnter(playerDead) {
    this.playerDead = playerDead
    this.boar.play("idle", "root state");
    this.dir = this.boar.dir
    this.player = this.boar.player
    this.boar.syncroNode.scale.x = this.dir
  }
  update() {
    if (this.playerDead) return
    const { x, y } = getGlobalPos(this.boar.syncroNode)
    const player = getGlobalPos(this.player)
    if (player.x > x - this.dir * 56 && player.x < x + this.lookAhead * this.dir && player.y < y + 48 && player.y > y - 100) {
      this.boar.switchState('run');
    }
  }
}


class Boar extends BoneAnimNode {
  //   static getDeathAnim() {
  //     if (this.deathAnim instanceof ParticleEmitter) return this.deathAnim
  //     this.deathAnim = new ParticleEmitter(deathAnimDat)
  //     this.deathAnim.noOverlay = true
  //     // this.deathAnim.overlay = [1,0,0]
  //     return this.deathAnim
  //   }
  static getBloodAnim() {
    if (this.bloodAnim instanceof ParticleEmitter) return this.bloodAnim
    this.bloodAnim = new ParticleEmitter(bloodAnimDat)
    this.bloodAnim.noOverlay = true
    return this.bloodAnim
  }
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