import * as Hitbox from "./hitbox.js";
import { Camera } from "./camera.js";
import { ZOOM } from "./globals.js";
import { Block } from "./entity/block.js";
function drawHitboxes(ctx) {

    Block.blocks.forEach(block => {
        ctx.fillRect(
            Math.round((block.gameEntity.hitboxes[0].x - Camera.getExactX()) * ZOOM),
            Math.round((block.gameEntity.hitboxes[0].y - Camera.getExactY()) * ZOOM),
            (block.gameEntity.hitboxes[0].width - Camera.getExactY()) * ZOOM,
            (block.gameEntity.hitboxes[0].height - Camera.getExactY()) * ZOOM
        );
    });
}
export { drawHitboxes };