import BoneAnimNode from "@lib/entities/BoneAnimNode";
import animData from "./anim.json"

class Monster extends BoneAnimNode {
  noOverlay = true
  constructor(x, y, player) {
    super({ data: animData, pos: { x, y } });
    this.play("idle", "root state");
    this.scale = { x: -1, y: 1 }
    this.play("run2", "run1")
  }
  update(dt, t) {
    super.update(dt, t)
    this.pos.x += -20 * dt
  }
}

export default Monster