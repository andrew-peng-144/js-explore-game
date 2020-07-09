//a gameentity that represents an impassible block.
//dis file holds the list of all bloques

import { GameEntity } from "../gameentity.js";
import { Hitbox } from "../hitbox.js";


function Block(x, y, w, h) {
    this.gameEntity = new GameEntity(x,y).withHitbox(
        new Hitbox()
        .shapeRectangle(x, y, w, h)
        .makeSolid()
    )
    Block.blocks.push(this);
}

Block.blocks = [];
export {Block};