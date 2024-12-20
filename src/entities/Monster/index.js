import BoneAnimNode from "@lib/entities/BoneAnimNode";
import animData from "./anim.json"

class Monster extends BoneAnimNode {
  constructor(x, y, player) {
    super({ data: animData, pos: { x, y } });
    this.play("idle", "root state");
    this.syncroNode.scale = { x: -1, y: 1 }
  }
}

export default Monster