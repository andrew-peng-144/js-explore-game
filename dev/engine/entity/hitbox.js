//A shape that represents a hitbox...
//also includes the Shape object: rect, circle, or poly.


//UGH HOW TO ORGANIZE THIS COLLISION STUFF???????????????
//



import { Point } from "../main/geom.js";
/**
 * Call to step the physics simulation
 * @type {Hitbox[]}
 */
var hitboxes = new Set();

/**
 * DO NOT USE THIS CONSTRUCTOR IN OTHER FILES.
 * A Hitbox is shaped like a convex polygon, and it responds to collision events.
 *  * 
 * // TODO docs needa be updatred. not just htis file
 * @param {GameEntity} entityRef reference to the GAME entity.
 * @param {*} shape RectangleShape, CircleShape, or PolygonShape
 * @param {Number} zid if nonzero, collision will only be handled with hitboxes of the same zid. if zero, handle collision with ALL others
 * @param {Number} refX the x value for a single point of refernce for hitbox. yes it uses 2 more numbers of RAM per hitbox. but it makes some computations faster and simpler.
 * */
function Hitbox(entityRef, shape, category, zid, offX, offY, solid) {
    this.entityRef = entityRef || null;
    this.offX = offX || 0; //The X value of the center/base position
    this.offY = offY || 0;

    this.shape = shape; //keep it simple

    // this.vertices = vertices.map(v => {
    //     v.x = v.x + this.refX;
    //     v.y = v.y + this.refY;
    //     return v;
    // }); //add each vertex to initx & inity.

    this.category = category || Category.DEFAULT;
    // this.type = type || Type.ZONE;
    // this.static = static || false;
    this.solid = solid || false;
    // this.dx = 0;
    // this.dy = 0;
    // this.ddx = 0;
    // this.ddy = 0;
    this.zid = zid || 0;


}

/**
 * only works for rectangleshape
 */
Hitbox.prototype.getWorldXTopLeft = function () {
    if (this.shape.constructor.name !== "RectangleShape") {
        throw "cant get worldX of a non-RectangleShape";
    }
    return this.entityRef.x - this.shape.width / 2 - this.offX;
}

/**
 * only works for rectangleshape
 */
Hitbox.prototype.getWorldYTopLeft = function () {
    if (this.shape.constructor.name !== "RectangleShape") {
        throw "cant get worldY of a non-RectangleShape";
    }
    return this.entityRef.y - this.shape.height / 2 - this.offY;
}

Hitbox.prototype.getShapeName = function () {
    return this.shape.constructor.name;
}

Hitbox.prototype.getEntity = function () {
    return this.entityRef;
}

/**
 * 
 * @param {Function} func first arg is the other hitbox.
 */
Hitbox.prototype.withCollisionHandle = function (func) {
    if (typeof func !== "function") {
        throw "ain't a function bruh";
    }
    this.onCollide = func;
}

Hitbox.prototype.remove = function() {
    hitboxes.delete(this);
}

/**
 * ZONE: Doesn't move, doesn't push other hitboxes. Only for detection. (e.g. pressure plate, target, z-transformer.)
 * BLOCK: Doesn't move, but pushes other hitboxes.
 * ACTOR: Can move, but doesn't push other hitboxes.
 */
// var Type = {
//     ZONE: 0,
//     BLOCK: 1,
//     ACTOR: 2
// }

/**
 * Category to easily differentiate b/t collision combinations
 */
var Category = {
    DEFAULT: 0,
    BLOCK: 1,
    PLAYER: 2,
    ENEMY: 4,
    FRIENDLY_PROJECTILE: 8,
    ENEMY_PROJECTILE: 16,
    TELEPORTER: 32,
    STAIR: 64,
    b7: 128,
    b8: 256,
    b9: 512,
    b10: 1024,
    b11: 2048,
    b12: 4096,
    b13: 8192,
    b14: 16384,
    b15: 32768,
    b16: 65536,
    b17: 131072 //BOMBER!!!!!!!!!
}


// }
/**
* @param {Number} offsetX the number of pixels that this hitbox is offset from the CENTER of the gameentity
*/
function createRectBlockHitbox(gameEntity, offX, offY, w, h, solid) {
    let hit = new Hitbox(gameEntity, new RectangleShape(w, h), Category.BLOCK, 0, offX, offY, solid);
    hitboxes.add(hit);
    return hit;
}

function createRectActorHitbox(gameEntity, offX, offY, w, h, solid, category) {
    let hit = new Hitbox(gameEntity, new RectangleShape(w, h), category || Category.DEFAULT, 0, offX, offY, solid);
    hitboxes.add(hit);
    return hit;
}


function RectangleShape(width, height) {
    this.width = width;
    this.height = height;
}
function CircleShape(r) {
    this.r = r;
}

var checkForCollisions = function () {
    //TODO QUADTREES CANCER.
    //Also maybe only check collisions between things with  category? idk???

    var i, j;
    var h1;

    //var h2, pairs = [], len = hitboxList.length;

    // for (i = 0; i < len; i++) {
    //     h1 = hitboxList[i];

    //     for (j = i + 1; j < len; j++) {
    //         h2 = hitboxList[j];

    //         if (h1.getShapeName() === "RectangleShape" && h2.getShapeName() === "RectangleShape") {
    //             if (twoRectCollision(
    //                 { x: h1.getWorldXTopLeft(), y: h1.getWorldYTopLeft(), width: h1.shape.width, height: h1.shape.height },
    //                 { x: h2.getWorldXTopLeft(), y: h2.getWorldYTopLeft(), width: h2.shape.width, height: h2.shape.height })) {

    //                 if (typeof h1.onCollide === "function") {
    //                     h1.onCollide(h2);
    //                 }
    //                 if (typeof h2.onCollide === "function") {
    //                     h2.onCollide(h1);
    //                 }

    //                 //pairs.push({ h1: h1, h2: h2 })
    //                 ;
    //             }
    //         }
    //     }
    // }

    //TODO iterate thru the hitboxes Set...

    // pairs.forEach(pair => {
    //     switch (pair.h1.category | pair.h2.category) {
    //         default:
    //             //LMFAO

    //             break;
    //     }
    // });
}
function twoRectCollision(rect1, rect2) {
    return (rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y);

}



//export { hitboxList, stepWorld, Type, Category, newRectBlockHitbox, newRectActorHitbox, newSlopeBlockHitbox, newStairZone_Right }
export { createRectBlockHitbox, createRectActorHitbox, Category, checkForCollisions };