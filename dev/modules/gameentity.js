import { MyImage, IMAGE } from "./imagedef.js";
import * as Hitbox from "./hitbox.js";
import { TILE_SIZE, ZOOM } from "./globals.js";
import { Camera } from "./camera.js";
import * as AssetLoader from "./assetloader.js";
//var idCounter = 0; //unique id for each gameentity

/**
 * A GameEntity is a set of data representing the position of an object in the game.
 * Optionally it may include extra data like a hitbox, sprite, or movement, associated with its position.
 */
function GameEntity(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}
GameEntity.create = function (x,y) {
    let w = new GameEntity(x, y);
    return w;
}
/**
 * 
 * @param {Hitbox} hitbox 
 */
GameEntity.prototype.withHitbox = function (hitbox) {
    if (this.hitboxes === undefined) {
        this.hitboxes = [];
    }
    this.hitboxes.push(hitbox);
    return this;
}

GameEntity.prototype.withSprite = function (sprite) {
    if (this.sprites === undefined) {
        this.sprites = [];
    }
    this.sprites.push(sprite);
    return this;
}

GameEntity.prototype.withKinematics = function (dx = 0, dy=0, ddx=0, ddy=0) {
    this.dx = dx;
    this.dy = dy;
    this.ddx = ddx;
    this.ddy = ddy;
    this.setVelocityRT = function (r, rad) {
        this.dx = r * Math.cos(rad);
        this.dy = r * Math.sin(rad);
    }
    return this;
}

GameEntity.prototype.update = function () {

    if (this.dx) {
        //update velocities based on accel
        this.dx += this.ddx;
        this.dy += this.ddy;

        //update pos based on velocity
        this.x += this.dx;
        this.y += this.dy;
    }
}

export {GameEntity};