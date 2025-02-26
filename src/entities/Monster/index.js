import BoneAnimNode from "@lib/entities/BoneAnimNode";
import animData from "./anim.json"

class Monster extends BoneAnimNode {
  noOverlay = true
  constructor({ x, y, player, span = 200 }) {
    super({ data: animData, pos: { x: x + 250, y } });
    this.play("idle", "root state");
    this.player = player
    this.syncroNode.scale.x = 1
    this.play("run2", "run1")
    this.span = span
  }
  update(dt, t) {
    // console.log(this.syncroNode.pos.x)
    if (this.syncroNode.pos.x > this.span && this.syncroNode.scale.x === 1) {
      this.syncroNode.scale.x *= -1
      // this.syncroNode.pos.x *= -1
    }
    super.update(dt, t)
  }
}

export default Monster