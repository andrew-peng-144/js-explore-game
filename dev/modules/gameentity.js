import { MyImage, IMAGE } from "./image.js";
import * as Hitbox from "./hitbox.js";
import * as RenderComponent from "./render-component.js"
import { TILE_SIZE, ZOOM } from "./globals.js";
import { Camera } from "./camera.js";
import * as AssetLoader from "./assetloader.js";
import * as KinematicComponent from "./kinematic-component.js";
//var idCounter = 0; //unique id for each gameentity

/**
   * DO NOT CALL THIS CONTRUCTOR FROM OTHER FILE
   * A GameEntity is a point (x,y), with optinally, a hitbox, and an associated IMAGE.
   * Fundamental building block of the game. Player, enemies, projectiles, walls, pressure plates.
   *
   * @param {Number} x x coordinate. acts as the CENTER of the gameentity by default (used for some components)
  * 
  * 
   */
function GameEntity(x, y) {
    this.x = x;
    this.y = y;
}


function createGenericEntity(x, y) {
    let ge = new GameEntity(x, y);
    return ge;
}
GameEntity.prototype.withRectHitbox = function (w, h, offX, offY) {
    let hit = Hitbox.createRectActorHitbox(this, offX, offY, w, h);
    this.hitbox = hit;
    return this;
}
GameEntity.prototype.withRenderComponent = function (image, offX, offY) {
    let rc = RenderComponent.createRenderComponent(this, image, offX, offY);
    this.renderComponent = rc;
    return this;

}
GameEntity.prototype.withKinematicComponent = function () {
    let kc = KinematicComponent.createKinematicComponent(this);
    this.kinematicComponent = kc;
    return this;
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


export { createGenericEntity }
//export { newGenericEntity, newActorEntity, GameEntity };