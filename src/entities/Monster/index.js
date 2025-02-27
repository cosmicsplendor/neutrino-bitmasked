import BoneAnimNode from "@lib/entities/BoneAnimNode";
import { stateMachineMixin } from "@lib/utils/FSM";
import animData from "./anim.json"
import { getGlobalPos } from "@lib/utils/entity";
import { TexRegion } from "@lib/index";
import getTestFn from "@lib/components/Collision/helpers/getTestFn";

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
    if (this.monster.syncroNode.pos.x > this.monster.span) {
      this.monster.switchState('idleRight');
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
    this.monster.noOverlay = Math.random() < 0.5 ? true: false
    this.timer += dt;
    if (this.timer >= 2) {
      // this.monster.switchState('runLeft');
      // die
    }
  }
}

class IdleRight {
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
    if (this.monster.syncroNode.pos.x < 0) {
      this.monster.switchState('idleLeft');
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
      runRight: new RunRight(this),
      idleRight: new IdleRight(this),
      runLeft: new RunLeft(this),
      idleLeft: new IdleLeft(this),
      glitch: new Glitch(this)
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
    const state = this.getState()
    if (state) state.update(dt);
    // Call the parent update method
    // this.player.pos.x = Math.round(getGlobalPos(this.syncroNode).x)
    // Object.assign(this.player.pos, getGlobalPos(this.syncroNode))
    if (this.testCol(this.syncroNode, this.player)) {
      // glitch
      // this.noOverlay = Math.random() < 0.5
      this.switchState('glitch');
    }

    super.update(dt, t);
  }
}

export default Monster