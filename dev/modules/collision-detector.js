//Explicitly handle each meaningful combination of collisions.
//order:
//player and blocks
//all entities and blocks
//player vs enemy projectiles
//enemy vs player projectiles.

import { Player } from "./entity/player.js";
import { Block } from "./entity/block.js";

import { Hitbox } from "./hitbox.js";

function detect() {
    debugger;
    Block.blocks.forEach(block => {
        
        if (Hitbox.isCollision(block.gameEntity.hitboxes[0], Player.gameEntity.hitboxes[0])) {
            Player.handleCollisionWithBlock(block);
        }
    });
}

export {detect};