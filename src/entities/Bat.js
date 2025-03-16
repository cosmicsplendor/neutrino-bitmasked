import { Node, TexRegion } from "@lib/index";
import { randf, sqDist } from "@lib/utils/math";

class Bat extends TexRegion {
    noOverlay = true;
    forceUpd = true
    constructor(x, y, player, interp=1, temp=true) {
        const scale = randf(0.5, 0.25);
        super({ frame: "bat1", pos: { x, y }, scale: { x: scale * (Math.random < 0.5 ? -1 : 1), y: scale } });
        this.player = player;
        const offsetAngle = 2 * Math.PI * Math.random();
        this.targetDx = -6 + 32 * Math.cos(offsetAngle);
        this.targetDy = 4 + 24 * Math.sin(offsetAngle);
        this.interp = randf(0.05, 0.005) * interp;
        this.alpha = 0.1;
        this.timer = 0;
        this.temp = temp
        this.originX = x
        this.originY = y
        // Minimal sine wave properties
        this.noiseOffset = Math.random() * Math.PI * 2; // Random starting phase
        this.noiseSpeed = randf(3, 2);                  // How fast the sine wave cycles
        this.noiseAmount = randf(1.2, 0.6);          // Very small amplitude

        // New property to track if bat is attached
        this.isAttached = false;
        this.duration = randf(0.2, 0.1)
    }

    fadeIn(dt) {
        if (this.alpha > 1) return;
        this.scale.x += dt;
        this.scale.y += dt;
        this.alpha += dt * 2;
    }
    updateAnim(dt) {
        this.timer += dt;
        if (this.timer >= this.duration) {
            this.timer = 0;
            this.frame = this.frame === "bat1" ? "bat2" : "bat1";
        }
    }
    reset() {
        if (this.temp) {
            this.remove()
            this.parent = null
        } else {
            this.pos.x = this.originX
            this.pos.y = this.originY
            this.isAttached = false
        }
    }
    update(dt) {
        this.fadeIn(dt);
        this.updateAnim(dt)

        // Update noise offset
        this.noiseOffset += dt * this.noiseSpeed;

        // Calculate small sine deviation
        const sineNoise = Math.sin(this.noiseOffset) * this.noiseAmount;

        // If already attached, just maintain the fixed position relative to player
        if (this.isAttached) {
            // this.pos.x = this.player.pos.x + this.targetDx;
            // this.pos.y = this.player.pos.y + this.targetDy;
            this.pos.x = this.player.pos.x + this.targetDx + sineNoise * 8;
            this.pos.y = this.player.pos.y + this.targetDy + sineNoise * 8;
            return;
        }
        // Calculate distance to target position
        const dx = this.player.pos.x + this.targetDx - this.pos.x;
        const dy = this.player.pos.y + this.targetDy - this.pos.y;

        // Check if close enough to attach
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
            // Snap to exact position and mark as attached
            this.isAttached = true;
            this.player.incWeight(1)
        } else {
            // Apply movement with very subtle sine deviation
            this.pos.x += dx * this.interp + sineNoise;
            this.pos.y += dy * this.interp + sineNoise;
        }
    }
}
class BatGroup extends Node {
    constructor({x, y, player, speed, soundSprite, temp=true}) {
        super({ pos: { x: 0, y: 0}})
        for (let i = 0; i < 8; i++) {
            const bat = new Bat(x, y, player, speed, temp)
            this.add(bat)
        }
        this.cm = { x: 0, y: 0}
        this.sound = soundSprite.create("bat")
        this.player = player
    }
    update() {
        let sumX = 0;
        let sumY = 0;
        const n = this.children.length;
        
        for (const child of this.children) {
            sumX += child.pos.x;
            sumY += child.pos.y;
        }

        this.cm.x = sumX / n;
        this.cm.y = sumY / n;

        const dist = sqDist(this.cm, this.player.pos);
        if (dist < 200000) {
            if (!this.sound.playing) {
                this.sound.play()
            }
            this.sound.volume = 1 - dist/200000
        } else {
            this.sound.pause()
        }
    }
}
export default BatGroup