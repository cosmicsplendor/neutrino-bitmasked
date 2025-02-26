import BoneAnimNode from "@lib/entities/BoneAnimNode";
import { stateMachineMixin } from "@lib/utils/FSM";
import animData from "./anim.json"
import { getGlobalPos } from "@lib/utils/entity";
import { TexRegion } from "@lib/index";
import getTestFn from "@lib/components/Collision/helpers/getTestFn";

// Define state classes
class RunRightState {
  constructor(monster) {
    this.monster = monster;
    this.name = 'runRight';
  }
  
  onEnter() {
    this.monster.play("run2", "run1");
    this.monster.syncroNode.scale.x = 1;
  }
  
  update(dt) {
    if (this.monster.syncroNode.pos.x > this.monster.span) {
      this.monster.switchState('idleRight');
    }
  }
  
  onExit() {
    // Optional cleanup
  }
}

class IdleRightState {
  constructor(monster) {
    this.monster = monster;
    this.name = 'idleRight';
  }
  
  onEnter() {
    this.monster.play("idle", "root state");
    this.timer = 0;
  }
  
  update(dt) {
    this.timer += dt;
    if (this.timer >= 3) {
      this.monster.switchState('runLeft');
    }
  }
  
  onExit() {
    // Optional cleanup
  }
}

class RunLeftState {
  constructor(monster) {
    this.monster = monster;
    this.name = 'runLeft';
  }
  
  onEnter() {
    this.monster.play("run2", "run1");
    this.monster.syncroNode.scale.x = -1;
  }
  
  update(dt) {
    if (this.monster.syncroNode.pos.x < 0) {
      this.monster.switchState('idleLeft');
    }
  }
  
  onExit() {
    // Optional cleanup
  }
}

class IdleLeftState {
  constructor(monster) {
    this.monster = monster;
    this.name = 'idleLeft';
  }
  
  onEnter() {
    this.monster.play("idle", "root state");
    this.timer = 0;
  }
  
  update(dt) {
    this.timer += dt;
    if (this.timer >= 3) {
      this.monster.switchState('runRight');
    }
  }
  
  onExit() {
    // Optional cleanup
  }
}

// Update Monster class to use external state classes
class Monster extends BoneAnimNode {
  noOverlay = true

  constructor({ x, y, player, span = 200 }) {
    super({ data: animData, pos: { x: x, y } });
    this.player = player
    this.syncroNode.scale.x = 1
    this.span = span
    this.syncroNode.pos.x = 0
    
    // Create state instances
    const states = {
      runRight: new RunRightState(this),
      idleRight: new IdleRightState(this),
      runLeft: new RunLeftState(this),
      idleLeft: new IdleLeftState(this)
    };
    
    // Apply the state machine mixin
    stateMachineMixin(this, states);
    this.switchState('runRight');
    this.syncroNode.hitCirc= {
      x: -60, y: 0, radius: 80
    }
    this.testCol = getTestFn(this.syncroNode, this.player)
  }
  
  update(dt, t) {
    // Update the current state
    this.getState()?.update(dt);
    // Call the parent update method
    // this.player.pos.x = Math.round(getGlobalPos(this.syncroNode).x)
    // Object.assign(this.player.pos, getGlobalPos(this.syncroNode))
    if (this.testCol(this.syncroNode, this.player)) {
      alert("HIT")
    }
    // this.noOverlay = Math.random() < 0.5
    super.update(dt, t);
  }
}

export default Monster