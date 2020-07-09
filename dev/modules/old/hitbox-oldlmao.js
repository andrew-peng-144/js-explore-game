//A shape that represents a hitbox...
//


//UGH HOW TO ORGANIZE THIS COLLISION STUFF???????????????
//



import { Point } from "./geom.js";
/**
 * Call to step the physics simulation
 * @type {Hitbox[]}
 */
var hitboxList = [];
function stepWorld() {
    hitboxList.forEach(h => {
        if (h.type == Type.ACTOR) {
            //update velocities based on accel
            h.dx += h.ddx;
            h.dy += h.ddy;

            //update center pos based on velocity
            h.refX += h.dx;
            h.refY += h.dy;
            //also update the vertex pos...
            h.vertices.forEach(v => {
                v.x += h.dx;
                v.y += h.dy;
                return v;
            });
        }
    });
}
/**
 * DO NOT USE THIS CONSTRUCTOR IN OTHER FILES.
 * A Hitbox is shaped like a convex polygon, and it responds to collision events.
 * A Hitbox may be static. That means it never moves on the world. That also means two static hitboxes never need to have collision handled b/t each other.
 * If it is not static then it will have velocity and acceleration.
 *  * 
 * @param {GameEntity} gameEntity reference to the parent entity. Not all hitboxes have this, put null.
 * @param {Point[]} vertices an array [[x1,y1],[x2,y2,]...] of vertices representing the shape, relative to (0,0) (so absolute numbers.)
 * @param {HType} category whose hitbox is this
 * @param {HProperty} type
 * @param {Number} zid if nonzero, collision will only be handled with hitboxes of the same zid. if zero, handle collision with ALL others
 * @param {Number} refX the x value for a single point of refernce for hitbox. yes it uses 2 more numbers of RAM per hitbox. but it makes some computations faster and simpler.
 * */
function Hitbox(gameEntity, vertices, type, category, zid, refX, refY) {
    this.gameEntity = gameEntity || null;
    this.refX = refX || 0; //The X value of a "reference" position, usually the center, which isn't used in collision but used for easy distance calculation.
    this.refY = refY || 0;

    this.vertices = vertices; //keep it simple

    // this.vertices = vertices.map(v => {
    //     v.x = v.x + this.refX;
    //     v.y = v.y + this.refY;
    //     return v;
    // }); //add each vertex to initx & inity.

    this.category = category || Category.DEFAULT;
    this.type = type || Type.ZONE;
    // this.static = static || false;
    // this.solid = solid || false;
    this.dx = 0;
    this.dy = 0;
    this.ddx = 0;
    this.ddy = 0;
    this.zid = zid || 0;


}
Hitbox.prototype.setVelocity = function (x, y) {
    this.dx = x; this.dy = y;
}
Hitbox.prototype.setVelocityX = function (dx) {
    this.dx = dx;
}
Hitbox.prototype.setVelocityY = function (dy) {
    this.dy = dy;
}
Hitbox.prototype.setVelocityRT = function (r, rad) {
    this.dx = r * Math.cos(rad);
    this.dy = r * Math.sin(rad);
}
Hitbox.prototype.addVelocity = function (x, y) {
    this.dx += x; this.dy += y;
}
Hitbox.prototype.getVelocityX = function () {
    return this.dx;
}
Hitbox.prototype.getVelocityY = function () {
    return this.dy;
}
// Hitbox.prototype.getSpeed = function () {
//     return Math.sqrt(this.dx * this.dx + this.dy + this.dy);
// }


Hitbox.prototype.addPosition = function (x, y) {
    this.vertices.forEach(function (e) { e.x += x; e.y += y; });
}

Hitbox.prototype.isStatic = function () {
    return this.type == Type.BLOCK || this.type == Type.ZONE;
}
// Hitbox.prototype.getEntity = function () {
//     return this.entityRef;
// }
Hitbox.prototype.setAcceleration = function (x, y) {
    this.ddx = x; this.ddy = y;
}
Hitbox.prototype.getAccelerationX = function () { return this.ddx; }
Hitbox.prototype.getAccelerationY = function () { return this.ddy; }
Hitbox.prototype.getFirstPoint = function () { return this.vertices[0]; }

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
var Type = {
    ZONE: 0,
    BLOCK: 1,
    ACTOR: 2
}

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





/**
 * ANY SHAPE, HIT"BOX" MAY BE A MISNOMER LMAO
 * @param {Point[]} vertices Convex. Clockwise.
 * @param initX THE CENTER X!! NOT THE TOP LEFT
 */
function newHitbox(gameEntity, vertices, hitboxType, hitboxCategory, zid, initX, initY) {
    var h = new Hitbox(gameEntity, vertices, hitboxType, hitboxCategory, zid, initX, initY);
    hitboxList.push(h);
    return h;
}

/**
 * Makes a rectangle hitbox with properties of a static block.
 * First vertex is always top-left.
 * @param {Number} x in world coordinates. TOP LEFT!
 * @param {*} y 
 * @param {*} width 
 * @param {*} height 
 */
function newRectBlockHitbox(x, y, width, height) {
    // return newHitbox(null, [
    //     new Point(-width / 2, -height / 2),
    //     new Point(width / 2, -height / 2),
    //     new Point(width / 2, height / 2),
    //     new Point(-width / 2, height / 2)],
    //     Type.BLOCK,
    //     Category.BLOCK,
    //     0,
    //     x, y);
    return newHitbox(null, [
        new Point(x, y),
        new Point(x + width, y),
        new Point(x + width, y + height),
        new Point(x, y + height)],
        Type.BLOCK,
        Category.BLOCK,
        0,
        x + width / 2, y + height / 2);
}

/**
 *  * @param {Number} x in world coordinates. TOP LEFT!
 * Makes a rectangle hitbox with properties of a moving actor.
 * First vertex is always top-left.
 */
function newRectActorHitbox(x, y, width, height, gameEntity, category) {
    // return newHitbox(gameEntity, [
    //     new Point(-width / 2, -height / 2),
    //     new Point(width / 2, -height / 2),
    //     new Point(width / 2, height / 2),
    //     new Point(-width / 2, height / 2)],
    //     Type.ACTOR,
    //     category,
    //     0,
    //     x, y);
    return newHitbox(gameEntity, [
        new Point(x, y),
        new Point(x + width, y),
        new Point(x + width, y + height),
        new Point(x, y + height)],
        Type.ACTOR,
        category,
        0,
        x + width / 2, y + height / 2);
}

/** * @param slopeDir 1: topleft, 2: topright, 3: bottomright, 4: bottomleft
 * The shape is a rectangle but cut in half diagonally, leaving only 3 vertices
*/
function newSlopeBlockHitbox(x, y, w, h, slopeDir) {
    var v;
    switch (slopeDir) {
        // case 1: v = [
        //     new Point(-width / 2, -height / 2),
        //     new Point(width / 2, -height / 2),
        //     new Point(-width / 2, height / 2)
        // ]; //topleft (refers to where the right angle is)
        //     break;
        // case 2: v = [
        //     new Point(-width / 2, -height / 2),
        //     new Point(width / 2, -height / 2),
        //     new Point(width / 2, height / 2)
        // ]; //topright
        //     break;
        // case 3: v = [
        //     new Point(width / 2, -height / 2),
        //     new Point(width / 2, height / 2),
        //     new Point(-width / 2, height / 2)
        // ];//bottomright
        //     break;
        // case 4: v = [
        //     new Point(-width / 2, -height / 2),
        //     new Point(width / 2, height / 2),
        //     new Point(-width / 2, height / 2)
        // ];//bottomleft
        case 1: v = [new Point(x, y), new Point(x + w, y), new Point(x, y + h)]; break; //topleft
        case 2: v = [new Point(x, y), new Point(x + w, y), new Point(x + w, y + h)]; break; //topright
        case 3: v = [new Point(x + w, y), new Point(x + w, y + h), new Point(x, y + h)]; break; //bottomright
        case 4: v = [new Point(x, y), new Point(x + w, y + h), new Point(x, y + h)]; break; //bottomleft
        default: throw "bad slope block type";
    }

    return newHitbox(null, v, Type.BLOCK, Category.BLOCK, 0, x + w / 2, y + h / 2);
}

/**
 * Wo.
 * @param stairDir 1: left, 2: right, 3: idk, not implemented rip.
 */
function newStairZone_Right(x, y, width, height, stairDir) {
    var v;
    return newHitbox(null, [
        new Point(x, y),
        new Point(x + width, y),
        new Point(x + width, y + height),
        new Point(x, y + height)],
        Type.ZONE,
        Category.STAIR,
        0,
        x + width / 2, y + height / 2);
}

// /**
//   * 
//   * @param {number} refX top left x of the outer rectangle of the octagon. this isn't on the octagon.
//   * @param {number} width width of outer rect
//   * @param {number} height height of outer rect
//   * @param {number} sliceSize width & height of each of the 4 triangles cut out at corners.
//   */
// function newOct(gameEntity, refX, refY, width, height, sliceSize, hitboxType, hitboxCategory) {
//     return newHitbox(gameEntity, [
//         refX + sliceSize, refY,
//         refX + width - sliceSize, refY,
//         refX + width, refY + sliceSize,
//         refX + width, refY + height - sliceSize,
//         refX + width - sliceSize, refY + height,
//         refX + sliceSize, refY + height,
//         refX, refY + height - sliceSize,
//         refX, refY + sliceSize
//     ], hitboxType, hitboxCategory);

// }

//TODO - faster than octagon, but must edit SAT to include arc shapes...
function newCircle() {

}

// /**
//  * a Block is a SOLID rectangle.
//  * @param {} x 
//  * @param {*} y 
//  * @param {*} w 
//  * @param {*} h 
//  * @param {*} static 
//  */
// function newBlock(gameEntity, x, y, w, h) {
//     //return p.newHitbox(x, y, w, h, null, p.Type.BLOCK, true);
//     return newAABB(gameEntity, x, y, w, h, Category.BLOCK, Type.BLOCK);
// }
// function newAABB(gameEntity, x, y, w, h, type, category) {
//     return newHitbox(gameEntity, [x, y, x + w, y, x + w, y + h, x, y + h],
//         type, category);
// }


export { hitboxList, stepWorld, Hitbox, Type, Category, newRectBlockHitbox, newRectActorHitbox, newSlopeBlockHitbox, newStairZone_Right }