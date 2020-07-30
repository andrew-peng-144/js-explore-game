
//import * as Hitbox from "./hitbox.js";
import * as RenderComponent from "./render-component.js"
//import * as AssetLoader from "../main/assetloader.js";
//import * as KinematicComponent from "./kinematic-component.js";
import * as InputComponent from "./input-component.js";
import * as Behavior from "./behavior.js";
//var idCounter = 0; //unique id for each gameentity
import * as PhysicsComponent from "./physics-component.js";

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
    /**
     * @private
     */
    this._x = x;
    /**
     * @private
     */
    this._y = y;

    //this.hitbox = null;
    this.renderComponent = null;
    //this.kinematicComponent = null;
    this.inputComponent = null;
    this.behavior = null;

    this.physicsComponent = null;
}
GameEntity.prototype.getX = function () { return this._x; }
GameEntity.prototype.getY = function () { return this._y; }
GameEntity.prototype.setX = function (x) {
    this._x = x;
}
GameEntity.prototype.setY = function (y) {
    this._y = y;
}

/**
 * asdf
 * @param {*} x 
 * @param {*} y 
 */
function createEntity(x, y) {
    let ge = new GameEntity(x, y);
    return ge;
}
// GameEntity.prototype.withRectActorHitbox = function (w, h, category, offX, offY) {
//     let hit = Hitbox.createRectActorHitbox(this, offX, offY, w, h, false, category);
//     this.hitbox = hit;
//     return this;
// }
// GameEntity.prototype.withRectHitbox = function (rectHitbox) {
//     if (rectHitbox.constructor.name !== "Hitbox") {
//         throw "withRectHitbox() must have Hitbox passed in";
//     }
//     if (rectHitbox.shape.constructor.name !== "RectangleShape") {
//         throw "w";
//     }
//     this.hitbox = rectHitbox;
// }
GameEntity.prototype.withRenderComponent = function (ctx, imageSection, camera, offsetX, offsetY) {
    let rc = RenderComponent.createRenderComponent(this, ctx, imageSection, camera, offsetX, offsetY);
    this.renderComponent = rc;
    return this;

}

GameEntity.prototype.withPhysicsComponent = function (physicsOptions) {
    if (!physicsOptions) {
        throw "br";
    }
    let pc = PhysicsComponent.addPhysicsComponent(this, physicsOptions);
    this.physicsComponent = pc;
    return this;
}
// GameEntity.prototype.withKinematicComponent = function () {
//     let kc = KinematicComponent.createKinematicComponent(this);
//     this.kinematicComponent = kc;
//     return this;
// }
/*
* Makes this gameentity respond to key events. Two Sets: keys down and keys just down, are sent as 1st and 2nd argument to the callback.
 */
GameEntity.prototype.withInputComponent = function (callback) {
    let ic = InputComponent.createInputComponent().setKeyListener(callback);
    this.inputComponent = ic;
    return this;
}
GameEntity.prototype.withBehavior = function (func) {
    // general scripting that runs every frame
    let bc = Behavior.addBehavior(func);
    this.behavior = bc;
    return this;
}

/**
 * IMMEDIATELY removes all components of the game entity from their respective data structures.
 * if entity wasn't in there in the first place then this function does nothing.
 */
GameEntity.prototype.removeNow = function () {

    //Nothing actually stores the GameEntity! in the engine at least. the user can still obviously store it so they ca nremove it later
    //It's only its components that are stored in their respective data structures.
    // if (this.hitbox) {
    //     this.hitbox.remove();
    // }
    gameEntitiesToBeRemoved.delete(this); //to avoid the rare case of getting immediately removed mid-tick yet still in the queue.

    if (this.renderComponent) {
        this.renderComponent.remove();
    }
    // if (this.kinematicComponent) {
    //     this.kinematicComponent.remove();
    // }
    if (this.inputComponent) {
        this.inputComponent.remove();
    }
    if (this.physicsComponent) {
        this.physicsComponent.remove();
    }
    if (this.behavior) {
        //this is probably how the rest of the components should be (static remove method) but whatever
        Behavior.remove(this.behavior);
    }

    console.log("REMOVED " + this.constructor.name);
}
var gameEntitiesToBeRemoved = new Set();
/**
 * // TODO
 * Mark this gameEntity as "to be removed" and may add it to a list.
 * Instead, fully remove all components from their respective lists/sets at the end
 */
GameEntity.prototype.queueDelayedRemove = function () {
    //same as remove, but only done when another function is called lul
    gameEntitiesToBeRemoved.add(this);
}

function doQueuedRemoves() {
    gameEntitiesToBeRemoved.forEach(e => {
        e.removeNow();
    });
    gameEntitiesToBeRemoved.clear();
}

// GameEntity.prototype.fields = function(obj) {
//     this.fields = obj;
//     return this;
// }
// GameEntity.prototype.withStateMachine = function() {
//     //how to incorporate this. since it seems to be a level above componentz.
//     throw "LMFAO";
// }

//TOO animator...
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


export { createEntity, doQueuedRemoves }
//export { newGenericEntity, newActorEntity, GameEntity };