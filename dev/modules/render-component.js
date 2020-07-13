// GameEntity.prototype.setHitbox = function (hitbox) { this.hitbox = hitbox; }
// GameEntity.prototype.getSpriteX = function () {
//     if (this.hitbox.shape.constructor.name === "RectangleShape") {
//         return this.hitbox.centerX - this.offsetX;
//     }
//     console.log("halp");
//     return 0;
// }
// GameEntity.prototype.getSpriteY = function () {
//     if (this.hitbox.shape.constructor.name === "RectangleShape") {
//         return this.hitbox.centerY - this.offsetY;

import { TILE_SIZE } from "./globals.js";
import * as AssetLoader from "./assetloader.js";
import { Camera } from "./camera.js";
import { ZOOM } from "./globals.js";

//     }
//     console.log("halp");
//     return 0;
// }
// GameEntity.prototype.getSpriteWidth = function () {
//     return this.image.swt * TILE_SIZE;
// }
// GameEntity.prototype.getSpriteHeight = function () {
//     return this.image.sht * TILE_SIZE;
// }
// GameEntity.prototype.getSpriteMaxX = function () { return this.getSpriteX() + this.getSpriteWidth() }
// GameEntity.prototype.getSpriteMaxY = function () { return this.getSpriteY() + this.getSpriteHeight() }
// GameEntity.prototype.isAnimated = function () { return this.image.n > 1; }

function RenderComponent(entityRef, image, offsetX, offsetY) {
    this.entityRef = entityRef;
    this.image = image;
    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;

    //for animations:
    this.nFrames = 0; //# frames this has been drawn
    this.nSlides = 0; //# slides passed in the animation
}

/**
 * draws the image to x and y screen coords.
 * Handles all animating.
 */
RenderComponent.prototype.draw = function (ctx) {



    let the_sxt = this.image.sxt;
    if (this.image.delay) {
        //animated..
        //debugger;
        if (this.nFrames % this.image.delay == 0 && this.nFrames / this.image.delay != 0) {
            this.nSlides++;
        }
        the_sxt = this.image.sxt + this.nSlides % this.image.n;

    }
    ctx.drawImage(AssetLoader.assets[this.image.fileStr],
        the_sxt * TILE_SIZE,
        this.image.syt * TILE_SIZE,
        this.image.swt * TILE_SIZE,
        this.image.sht * TILE_SIZE,
        Math.round((this.entityRef.x - this.getWidth() / 2 - this.offsetX - Camera.getExactX()) * ZOOM),
        Math.round((this.entityRef.y - this.getHeight() / 2 - this.offsetY - Camera.getExactY()) * ZOOM),
        this.image.swt * TILE_SIZE * ZOOM,
        this.image.sht * TILE_SIZE * ZOOM
    );

    this.nFrames++;
}
RenderComponent.prototype.getWidth = function () {
    return this.image.swt * TILE_SIZE;
}
RenderComponent.prototype.getHeight = function () {
    return this.image.sht * TILE_SIZE;
}

var renderComponents = [];

/**
 * 
 * @param {Number} offsetX the number of pixels that this image is offset (subtracted) from the center of the gameentity
 */
function createRenderComponent(entityRef, image, offsetX, offsetY) {
    let rc = new RenderComponent(entityRef, image, offsetX, offsetY);
    renderComponents.push(rc);
    return rc;
}

var drawAll = function(ctx) {
    if (!ctx) {
        throw "pls";
    }
    renderComponents.forEach(r => r.draw(ctx));
}
export { createRenderComponent, drawAll }