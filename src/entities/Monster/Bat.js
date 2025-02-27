import { TexRegion } from "@lib/index";
import { randf } from "@lib/utils/math";

class Bat extends TexRegion {
    noOverlay = true;
    constructor(x, y, player) {
        const scale = randf(0.5, 0.25);
        super({ frame: "bat1", pos: { x, y }, scale: { x: scale, y: scale } });
        this.player = player;
        const offsetAngle = 2 * Math.PI * Math.random();
        this.targetDx = 32 - 38 + 32 * Math.cos(offsetAngle);
        this.targetDy = 32 - 44 + 32 * Math.sin(offsetAngle);
        this.interp = randf(0.025, 0.0025);
        this.alpha = 0.1;
        this.timer = 0;

        // Minimal sine wave properties
        this.noiseOffset = Math.random() * Math.PI * 2; // Random starting phase
        this.noiseSpeed = randf(3, 2);                  // How fast the sine wave cycles
        this.noiseAmount = randf(1.5, 0.8);             // Very small amplitude
    }

    fadeIn(dt) {
        if (this.alpha > 1) return;
        this.scale.x += dt;
        this.scale.y += dt;
        this.alpha += dt * 2;
    }

    update(dt) {
        this.fadeIn(dt);
        this.timer += dt;
        if (this.timer >= 0.125) {
            this.timer = 0;
            this.frame = this.frame === "bat1" ? "bat2" : "bat1";
        }

        // Update noise offset
        this.noiseOffset += dt * this.noiseSpeed;

        // Calculate small sine deviation
        const sineNoise = Math.sin(this.noiseOffset) * this.noiseAmount;

        const dx = this.player.pos.x + this.targetDx - this.pos.x;
        const dy = this.player.pos.y + this.targetDy - this.pos.y;

        // Apply movement with very subtle sine deviation
        this.pos.x += dx * this.interp + sineNoise;
        this.pos.y += dy * this.interp + sineNoise;
    }
}

export default Bat  