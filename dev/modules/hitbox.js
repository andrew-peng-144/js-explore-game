//A shape that represents a hitbox...
//also includes the Shape object: rect, circle, or poly.


//UGH HOW TO ORGANIZE THIS COLLISION STUFF???????????????
//



import { Point } from "./geom.js";
/**
 * Call to step the physics simulation
 * @type {Hitbox[]}
 */
var hitboxList = [];
// function stepWorld() {
//     hitboxList.forEach(h => {
//         if (h.type == Type.ACTOR) {
//             //update velocities based on accel
//             h.dx += h.ddx;
//             h.dy += h.ddy;

//             //update center pos based on velocity
//             h.refX += h.dx;
//             h.refY += h.dy;
//             //also update the vertex pos...
//             h.vertices.forEach(v => {
//                 v.x += h.dx;
//                 v.y += h.dy;
//                 return v;
//             });
//         }
//     });
// }
/**
 * DO NOT USE THIS CONSTRUCTOR IN OTHER FILES.
 * A Hitbox is shaped like a convex polygon, and it responds to collision events.
 * A Hitbox may be static. That means it never moves on the world. That also means two static hitboxes never need to have collision handled b/t each other.
 * If it is not static then it will have velocity and acceleration.
 *  * 
 * // TODO docs needa be updatred. not just htis file
 * @param {GameEntity} entityRef reference to the GAME entity.
 * @param {*} shape RectangleShape, CircleShape, or PolygonShape
 * @param {Number} zid if nonzero, collision will only be handled with hitboxes of the same zid. if zero, handle collision with ALL others
 * @param {Number} refX the x value for a single point of refernce for hitbox. yes it uses 2 more numbers of RAM per hitbox. but it makes some computations faster and simpler.
 * */
function Hitbox(entityRef, shape, category, zid, offX, offY) {
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
    // this.solid = solid || false;
    // this.dx = 0;
    // this.dy = 0;
    // this.ddx = 0;
    // this.ddy = 0;
    this.zid = zid || 0;


}
// Hitbox.prototype.setVelocity = function (x, y) {
//     this.dx = x; this.dy = y;
// }
// Hitbox.prototype.setVelocityX = function (dx) {
//     this.dx = dx;
// }
// Hitbox.prototype.setVelocityY = function (dy) {
//     this.dy = dy;
// }
// Hitbox.prototype.setVelocityRT = function (r, rad) {
//     this.dx = r * Math.cos(rad);
//     this.dy = r * Math.sin(rad);
// }
// Hitbox.prototype.addVelocity = function (x, y) {
//     this.dx += x; this.dy += y;
// }
// Hitbox.prototype.getVelocityX = function () {
//     return this.dx;
// }
// Hitbox.prototype.getVelocityY = function () {
//     return this.dy;
// }
// Hitbox.prototype.getSpeed = function () {
//     return Math.sqrt(this.dx * this.dx + this.dy + this.dy);
// }


// Hitbox.prototype.addPosition = function (x, y) {
//     this.vertices.forEach(function (e) { e.x += x; e.y += y; });
// }

Hitbox.prototype.isStatic = function () {
    return this.type == Type.BLOCK || this.type == Type.ZONE;
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

// Hitbox.prototype.getEntity = function () {
//     return this.entityRef;
// }
// Hitbox.prototype.setAcceleration = function (x, y) {
//     this.ddx = x; this.ddy = y;
// }
// Hitbox.prototype.getAccelerationX = function () { return this.ddx; }
// Hitbox.prototype.getAccelerationY = function () { return this.ddy; }
// Hitbox.prototype.getFirstPoint = function () { return this.vertices[0]; }

// /**
//This is unnecesary b/c it needs to be called very often (many times per frame to check collisions) and every single call makes a new array...
//  * Adds all the base vertices to the center positions and returns a new vertex array
//  */
// Hitbox.prototype.getWorldVertices = function () {
//     var result = [];
//     this.baseVertices.forEach(p => { p.x += this.centerX; p.y += this.centerY });
//     return result;
// }

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





// /**
//  * ANY SHAPE, HIT"BOX" MAY BE A MISNOMER LMAO
//  * @param {Point[]} vertices Convex. Clockwise.
//  * @param initX THE CENTER X!! NOT THE TOP LEFT
//  */
// function newHitbox(gameEntity, vertices, hitboxType, hitboxCategory, zid, initX, initY) {
//     var h = new Hitbox(gameEntity, vertices, hitboxType, hitboxCategory, zid, initX, initY);
//     hitboxList.push(h);
//     return h;
// }

// /**
//  * Makes a rectangle hitbox with properties of a static block.
//  * First vertex is always top-left.
//  * @param {Number} x in world coordinates. TOP LEFT!
//  * @param {*} y 
//  * @param {*} width 
//  * @param {*} height 
//  */
// function newRectBlockHitbox(x, y, width, height) {
//     // return newHitbox(null, [
//     //     new Point(-width / 2, -height / 2),
//     //     new Point(width / 2, -height / 2),
//     //     new Point(width / 2, height / 2),
//     //     new Point(-width / 2, height / 2)],
//     //     Type.BLOCK,
//     //     Category.BLOCK,
//     //     0,
//     //     x, y);
//     return newHitbox(null, [
//         new Point(x, y),
//         new Point(x + width, y),
//         new Point(x + width, y + height),
//         new Point(x, y + height)],
//         Type.BLOCK,
//         Category.BLOCK,
//         0,
//         x + width / 2, y + height / 2);
// }

// /**
//  *  * @param {Number} x in world coordinates. TOP LEFT!
//  * Makes a rectangle hitbox with properties of a moving actor.
//  * First vertex is always top-left.
//  */
// function newRectActorHitbox(x, y, width, height, gameEntity, category) {
//     // return newHitbox(gameEntity, [
//     //     new Point(-width / 2, -height / 2),
//     //     new Point(width / 2, -height / 2),
//     //     new Point(width / 2, height / 2),
//     //     new Point(-width / 2, height / 2)],
//     //     Type.ACTOR,
//     //     category,
//     //     0,
//     //     x, y);
//     return newHitbox(gameEntity, [
//         new Point(x, y),
//         new Point(x + width, y),
//         new Point(x + width, y + height),
//         new Point(x, y + height)],
//         Type.ACTOR,
//         category,
//         0,
//         x + width / 2, y + height / 2);
// }

// /** * @param slopeDir 1: topleft, 2: topright, 3: bottomright, 4: bottomleft
//  * The shape is a rectangle but cut in half diagonally, leaving only 3 vertices
// */
// function newSlopeBlockHitbox(x, y, w, h, slopeDir) {
//     var v;
//     switch (slopeDir) {
//         case 1: v = [new Point(x, y), new Point(x + w, y), new Point(x, y + h)]; break; //topleft
//         case 2: v = [new Point(x, y), new Point(x + w, y), new Point(x + w, y + h)]; break; //topright
//         case 3: v = [new Point(x + w, y), new Point(x + w, y + h), new Point(x, y + h)]; break; //bottomright
//         case 4: v = [new Point(x, y), new Point(x + w, y + h), new Point(x, y + h)]; break; //bottomleft
//         default: throw "bad slope block type";
//     }

//     return newHitbox(null, v, Type.BLOCK, Category.BLOCK, 0, x + w / 2, y + h / 2);
// }

// /**
//  * Wo.
//  * @param stairDir 1: left, 2: right, 3: idk, not implemented rip.
//  */
// function newStairZone_Right(x, y, width, height, stairDir) {
//     var v;
//     return newHitbox(null, [
//         new Point(x, y),
//         new Point(x + width, y),
//         new Point(x + width, y + height),
//         new Point(x, y + height)],
//         Type.ZONE,
//         Category.STAIR,
//         0,
//         x + width / 2, y + height / 2);
// }

//TODO - faster than octagon, but must edit SAT to include arc shapes...
// function newCircle() {

// }
/**
* @param {Number} offsetX the number of pixels that this hitbox is offset from the CENTER of the gameentity
*/
function createRectBlockHitbox(gameEntity, offX, offY, w, h) {
    let hit = new Hitbox(gameEntity, new RectangleShape(w, h), Category.BLOCK, 0, offX, offY);
    hitboxList.push(hit);
    return hit;
}

function createRectActorHitbox(gameEntity, offX, offY, w, h) {
    let hit = new Hitbox(gameEntity, new RectangleShape(w, h), Category.b17, 0, offX, offY);
    hitboxList.push(hit);
    return hit;
}

function RectangleShape(width, height) {
    this.width = width;
    this.height = height;
}
function CircleShape(r) {
    this.r = r;
}
// /**
//  * 
//  * @param {Point[]} vertices a collection of points that represents a convex polygon.
//  */
// function PolygonShape(vertices) {
//     this.vertices = vertices;
// }



//export { hitboxList, stepWorld, Type, Category, newRectBlockHitbox, newRectActorHitbox, newSlopeBlockHitbox, newStairZone_Right }
export { createRectBlockHitbox, createRectActorHitbox, hitboxList, Category };