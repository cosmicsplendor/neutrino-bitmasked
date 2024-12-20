import BoneAnimNode from "@lib/entities/BoneAnimNode";
import animData from "./anim.json"

class Monster extends BoneAnimNode {
  constructor(x, y, player) {
    super({ data: animData, pos: { x, y } });
  }
}

export default Monster