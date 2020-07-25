
import * as Hitbox from "./hitbox.js";
import * as RenderComponent from "./render-component.js"
//import * as AssetLoader from "../main/assetloader.js";
import * as KinematicComponent from "./kinematic-component.js";
import * as InputComponent from "./input-component.js";
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

    this.hitbox = null;
    this.renderComponent = null;
    this.kinematicComponent = null;
    this.inputComponent = null;
    this.customBehavior = null;
}


function createEntity(x, y) {
    let ge = new GameEntity(x, y);
    return ge;
}
GameEntity.prototype.withRectActorHitbox = function (w, h, category, offX, offY) {
    let hit = Hitbox.createRectActorHitbox(this, offX, offY, w, h, false, category);
    this.hitbox = hit;
    return this;
}
GameEntity.prototype.withRectHitbox = function (rectHitbox) {
    if (rectHitbox.constructor.name !== "Hitbox") {
        throw "withRectHitbox() must have Hitbox passed in";
    }
    if (rectHitbox.shape.constructor.name !== "RectangleShape") {
        throw "w";
    }
    this.hitbox = rectHitbox;
}
GameEntity.prototype.withRenderComponent = function (ctx, imageSection, camera, offsetX, offsetY) {
    let rc = RenderComponent.createRenderComponent(this, ctx, imageSection, camera, offsetX, offsetY);
    this.renderComponent = rc;
    return this;

}
GameEntity.prototype.withKinematicComponent = function () {
    let kc = KinematicComponent.createKinematicComponent(this);
    this.kinematicComponent = kc;
    return this;
}
/**
 * Makes this gameentity respond to key events. A Set of keys down is sent as the argument to the callback. (0 isn't a key)
 * @param {Function} callback 
 */
GameEntity.prototype.withInputComponent = function (callback) {
    let ic = InputComponent.createInputComponent().setKeyListener(callback);
    this.inputComponent = ic;
    return this;
}
GameEntity.prototype.withBehavior = function () {
    // TODO general scripting that runs every frame
}


GameEntity.prototype.remove = function () {
    //TODO clean remove that disposes all components

    //Nothing actually stores the GameEntity! in the engine at least. the user can still obviously store it so they ca nremove it later
    //It's only its components that are stored in their respective data structures.
    if (this.hitbox) {
        this.hitbox.remove();
    }
    if (this.renderComponent) {
        this.renderComponent.remove();
    }
    if (this.kinematicComponent) {
        this.kinematicComponent.remove();
    }
    if (this.inputComponent) {
        this.inputComponent.remove();
    }
}

// GameEntity.prototype.fields = function(obj) {
//     this.fields = obj;
//     return this;
// }
// GameEntity.prototype.withStateMachine = function() {
//     //how to incorporate this. since it seems to be a level above componentz.
//     throw "LMFAO";
// }

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


export { createEntity }
//export { newGenericEntity, newActorEntity, GameEntity };