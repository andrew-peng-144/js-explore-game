import { MyImage, IMAGE } from "./image.js";
import * as Hitbox from "./hitbox.js";
import { TILE_SIZE, ZOOM } from "./globals.js";
import { Camera } from "./camera.js";
import * as AssetLoader from "./assetloader.js";
//var idCounter = 0; //unique id for each gameentity

/**
   * DO NOT CALL THIS CONTRUCTOR FROM OTHER FILE
   * A GameEntity is a HITBOX and an associated IMAGE. Fundamental building block of the game. Player, enemies, projectiles, walls, pressure plates. but NOT a tile w/ collisino
   * Every actor in the game is a GameEntity. This will be a FIELD in each Actor's class. 
   * Actors include: player, enemy, projectile
   *
   * For GameEntity to be drawn properly, call draw()
   * @param {Hitbox.Hitbox} hitbox REQUIRED
   * @param {MyImage} image REQUIRED
   * @param {number} offsetX x distance between sprite x and hitbox's x. (x on hitbox being the first point, usually the top left corner.)
  *  @param {number} offsetY same case as offsetX
  *  Width and height of the game entities are handled in the factory methods
  * 
  * 
   */
function GameEntity(image, offsetX, offsetY) {
    this.hitbox = null;
    this.image = image;
    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;

    //for animations:
    this.nFrames = 0; //# frames this has been drawn
    this.nSlides = 0; //# slides passed in the animation

    // if (image.animated) {
    //     this.loopingCounter = new timing.LoopingCounter(image.sxti, image.sxtf, image.delay);
    //     this.currentFrame = 0;
    // }
}
GameEntity.prototype.setHitbox = function (hitbox) { this.hitbox = hitbox; }
GameEntity.prototype.getSpriteX = function () {
    return this.hitbox.getFirstPoint().x - this.offsetX;
}
GameEntity.prototype.getSpriteY = function () {
    return this.hitbox.getFirstPoint().y - this.offsetY;
}
GameEntity.prototype.getSpriteWidth = function () {
    return this.image.swt * TILE_SIZE * ZOOM;
}
GameEntity.prototype.getSpriteHeight = function () {
    return this.image.sht * TILE_SIZE * ZOOM;
}
GameEntity.prototype.getSpriteMaxX = function () { return this.getSpriteX() + this.getSpriteWidth() }
GameEntity.prototype.getSpriteMaxY = function () { return this.getSpriteY() + this.getSpriteHeight() }
GameEntity.prototype.isAnimated = function () { return this.image.n > 1; }

GameEntity.prototype.draw = function (ctx) {
    var sx = 0;
    // if (this.isAnimated())
    //     sx = this.loopingCounter.getCurrentNumber() * TILE_SIZE;
    // else
    //     sx = this.image.sxt * TILE_SIZE;

    this.image.draw(ctx, this.getSpriteX() - Camera.getExactX(), this.getSpriteY() - Camera.getExactY(), ZOOM);


}


/**
 * draws the image to x and y screen coords.
 * Handles all animating.
 */
GameEntity.prototype.draw = function (ctx) {



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
        Math.round((this.getSpriteX() - Camera.getExactX()) * ZOOM),
        Math.round((this.getSpriteY() - Camera.getExactY()) * ZOOM),
        this.image.swt * TILE_SIZE * ZOOM,
        this.image.sht * TILE_SIZE * ZOOM
    );

    this.nFrames++;
}



/**
 * create a game entity on the map to test stuffs, with solid hitbox.
 * @param {MyImage} image
 */
function newGenericEntity(x, y, image) {
    var g = new GameEntity(image, 0, 0);
    g.setHitbox(Hitbox.newRectBlockHitbox(x, y, image.swt * TILE_SIZE, image.sht * TILE_SIZE));
    //genericEntities.push(g);
    return g;
}
/**
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} image 
 * @param {*} offsetX 
 * @param {*} offsetY 
 * @param {*} hitboxWidth custom width for hitbox for use if offset is defined. leave blank for it to just be sprite's width
 * @param {*} hitboxHeight 
 */
function newActorEntity(x, y, image, offsetX = 0, offsetY = 0, hitboxWidth, hitboxHeight) {
    var g = new GameEntity(image, offsetX, offsetY);
    g.setHitbox(Hitbox.newRectActorHitbox(x, y, hitboxWidth || image.swt * TILE_SIZE, hitboxHeight || image.sht * TILE_SIZE, g, Hitbox.Category.PLAYER));
    return g;
}

//TODO animator...
// (function Animator() {
//     var pub = {};
//     var anims = [];
//     var addAnimation = function (animatedImage) {
//         anims.push[{ img: animatedImage, counter: 0 }];
//     }
//     var update = function () {
//         anims.forEach(anim => {
//             anim.counter++;
//             if (counter >= img.n) {
//                 anim.counter = 0;
//             }
//         });

//     }
//     var removeAnimation = function (animatedImage) {
//         anims.filter(a => { a.img === anim });
//     }
//     return update;
// })();



export { newGenericEntity, newActorEntity, GameEntity };