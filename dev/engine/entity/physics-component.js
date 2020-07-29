//The component of an entity that may make it move and handles collision with other entities.


//Used to be separated into two components (hitbox and kinematic) but when trying to implement clean collision handling,
//there resulted in too much coupling between the classes

//array because easier to iterate thru without duplicate checks when detecting collision, despite array have slower add/remove.
var physicsComps = new Array();
/**
 * 
 * @param {GameEntity} entityRef 
 * @param {PhysicsOptions} physicsOptions 
 */
function PhysicsComponent(entityRef, physicsOptions) {

    if (physicsOptions._awerfwifwhofiwhofiqwf !== 2) {
        //default options if nothing is passed in
        //throw "A";
        physicsOptions = new PhysicsOptions();
    }
    this.entityRef = entityRef;
    this._opts = physicsOptions;

    //controller is "private" and only shud be modified by user as its passed in as arg to physicsOptions.control 
    this._controller = new PhysicsController();
}

PhysicsComponent.prototype.remove = function () {
    //physicsComps.delete(this);
    let i = physicsComps.indexOf(this);
    if (i > -1) {
        physicsComps.splice(i, 1);
    }
}
PhysicsComponent.prototype.getHitbox = function (index = 0) {
    return this._opts._hitboxes[index];
}
PhysicsComponent.prototype.getNumHitboxes = function () {
    return this._opts._hitboxes.length;
}
PhysicsComponent.prototype.isStatic = function () {
    return this._opts._control === null;
}

PhysicsComponent.prototype.getWorldXTopLeft = function (hitboxIndex = 0) {
    let hitbox = this.getHitbox(hitboxIndex);
    if (!isRectHitbox(hitbox)) {
        throw "cant get worldX of a non-Rectangle hitbox";
    }
    return this.entityRef.getX() - hitbox.width / 2 - hitbox.xOff;
}
PhysicsComponent.prototype.getWorldYTopLeft = function (hitboxIndex = 0) {
    let hitbox = this.getHitbox(hitboxIndex);
    if (!isRectHitbox(hitbox)) {
        throw "cant get worldY of a non-Rectangle hitbox";
    }
    return this.entityRef.getY() - hitbox.height / 2 - hitbox.yOff;
}

/**
 * add a PhysicsComponent to the system, using settings from the global PhysicsOptions object
 */
function addPhysicsComponent(entityRef, physicsOptions) {

    let pc = new PhysicsComponent(entityRef, physicsOptions);
    //physicsComps.add(pc);
    physicsComps.push(pc);
    return pc;
}


function RectangleHitbox(xOff, yOff, width, height, solid = false, zid = 0) {
    this.xOff = xOff;
    this.yOff = yOff;
    this.width = width;
    this.height = height;
    this.solid = solid;
    this.zid = zid;
    if (!isRectHitbox(this)) {
        throw "bruh";
    }
}
function isRectHitbox(hitbox) {
    return typeof hitbox.xOff === "number"
        && typeof hitbox.yOff === "number"
        && typeof hitbox.width === "number"
        && typeof hitbox.height === "number"
        && typeof hitbox.solid === "boolean"
        && typeof hitbox.zid === "number";
}
// function CircleHitbox(r) {
//     this.r = r;
// } // TODO

/**
 * a cleaner way to set properties of physics component instead of passing like 7 params
 * An object of this is NOT copied over, instead the physicscomponent object will hold a REFERENCE to this.
 */
function PhysicsOptions() {
    this._awerfwifwhofiwhofiqwf = 2;
    this._hitboxes = new Array();
    //this.kinematic = false;
    this._onCollide = null;
    this._control = null; //controller function for movement. set displacement. stationary hitbox if null.
    this._getCollisionData = null;
    //this._solid = false; //each hitbox has its own solidity properties
}

PhysicsOptions.prototype.addRectHitbox = function (xOff, yOff, w, h, solid, zid) {
    this._hitboxes.push(new RectangleHitbox(xOff, yOff, w, h, solid, zid));
    return this;
}
// PhysicsOptions.prototype.setKinematic = function (bool) {
//     this.kinematic = bool;
//     return this;
// }
/**
 * 
 * @param {Function} func collision handling function, with other pc's hitbox index passed in as 1st arg and data passed in as 2nd arg
 * if you want to remove object, use a delayed remove (not implemented yet), or else could cause errors if instantly removed and there's no other hitbox
 */
PhysicsOptions.prototype.setOnCollideFunc = function (func) {
    if (typeof func !== "function") {
        throw "AAA";
    }
    this._onCollide = func;
    return this;
}
/**
 * 
 * @param {Function} func controller function, with "controller" passed in as 1st arg
 * use controller.setDX(num) and controller.setDY(num) to set displacement of this entity on this frame.
 * If this function is called, it makes the hitbox assumed to be NOT STATIC! for now!
 */
PhysicsOptions.prototype.setControlFunc = function (func) {
    if (typeof func !== "function") {
        throw "AAA";
    }
    this._control = func;
    return this;
}

/**
 * 
 * @param {Function} func function that returns some collision data that the other object of a collision should be able to see (not modify)
 * Preferably, return a pre-allocated object or number, not a newly-allocated object.
 * e.g. get hit by projectile with 5 damage. the 5 needs to be sent to the recipient
 * so pass in "function() {return damage;}" where damage was set to 5 in that context
 */
PhysicsOptions.prototype.setCollisionDataFunc = function (func) {
    if (typeof func !== "function") {
        throw "AAA";
    }
    this._getCollisionData = func;
    return this;
}

// PhysicsOptions.prototype.setSolid = function (bool) {
//     this._solid = bool;
//     return this;
// }


/**
 * Controller for changing position of entity
 */
function PhysicsController() {
    //this.isPhysicsController = true;
    this._dx = 0;
    this._dy = 0;
}
PhysicsController.prototype.setDX = function (dx) {
    this._dx = dx;
}
PhysicsController.prototype.setDY = function (dy) {
    this._dy = dy;
}

// unneeded? b/c user can just make their own getData() function that can return any kind of data.
// //data of a p.c. that is made known to the other p.c. when they collide (in the other p.c.'s onCollide method)
// function CollisionData() {
//     this.propA = 0;
//     this.propB = 0;
//     this.propC = 0;
// }


function updateAll() {
    //debugger;
    //move entities by their displacement value, if non-static
    physicsComps.forEach(pc => {
        if (!pc.isStatic()) {
            if (typeof pc._opts._control !== "function") {
                throw "rip";
            }
            pc._opts._control(pc._controller); //if exists, call user-implemented _control to modify the value of controller
            pc.entityRef._x += pc._controller._dx;
            pc.entityRef._y += pc._controller._dy;

            //reset controller
            pc._controller._dx = 0;
            pc._controller._dy = 0;
        }
    });

    //re-iterate:

    //todo quadtrees lmfao.

    //let effectiveHitboxA, effectiveHitboxB;
    //return;
    //do naive O(n^2) detection for now
    /**
     * @type {RectangleHitbox}
     */
    let hitA, hitB;
    /**
     * @type {PhysicsComponent}
     */
    let pcA, pcB;
    let i, j, hA_index, hB_index, pcLen = physicsComps.length, hA_len, hB_len;
    for (i = 0; i < pcLen; i++) {
        pcA = physicsComps[i];

        pcInnerLoop:
        for (j = i + 1; j < pcLen; j++) {
            pcB = physicsComps[j];

            if (pcA.isStatic() && pcB.isStatic()) {
                //never handle collision between two static physicsComponents.
                continue;
            }
            hA_len = pcA.getNumHitboxes();
            hB_len = pcB.getNumHitboxes();
            for (hA_index = 0; hA_index < hA_len; hA_index++) {
                for (hB_index = 0; hB_index < hB_len; hB_index++) {


                    hitA = pcA.getHitbox(hA_index);
                    hitB = pcB.getHitbox(hB_index);

                    //Rectangle-rectangle case
                    if (isRectHitbox(hitA) && isRectHitbox(hitB)) {
                        //both are rectangles

                        //if ANY HITBOX of pcA collides with any of pcB, call oncollide for both sides, and pass in the index (like an ID) of the hitbox and the coll.data.

                        //TODO this could further be denominated into "shape": a hitbox can have multiple shapes,
                        //to allow for more complex "modular-shaped" hitboxes

                        if (!twoRectCollision( //x1, y1, w1, h1, x2, y2, w2, h2
                            pcA.getWorldXTopLeft(hA_index),
                            pcA.getWorldYTopLeft(hA_index),
                            hitA.width,
                            hitA.height,
                            pcB.getWorldXTopLeft(hB_index),
                            pcB.getWorldYTopLeft(hB_index),
                            hitB.width,
                            hitB.height,
                        )) {
                            //these hitboxes didn't collide, so goto next pair of hitboxes
                            continue;
                        }
                        //alert("A");
                        //debugger;

                        //they collided, call their individual collision handling methods if they have it
                        if (typeof pcA._opts._onCollide === "function") {
                            //send hitbox index of B and B's data to A's collision handling method (if B has data to send)
                            pcA._opts._onCollide(hB_index, typeof pcB._opts._getCollisionData === "function" ? pcB._opts._getCollisionData() : null);
                        }
                        if (typeof pcB._opts._onCollide === "function") {
                            pcB._opts._onCollide(hA_index, typeof pcA._opts._getCollisionData === "function" ? pcA._opts._getCollisionData() : null);
                        }

                        debugger;
                        if (!hitA.solid || !hitB.solid) {
                            //both hitboxes need to be solid to resolve solidity.
                            continue;
                        }
                        //handle solidity (for rectangles), which MOVES one or both of the entities an extra time.
                        //e.g. a player cannot walk into a wall, so player should get pushed back
                        //e.g. the enemy cannot walk into the player, but since both are moving actors, whichever has higher "priority" (?) will get pushed and other stays
                        //may result in weird/inconsistent behavior. as collision is not checked directly after this extra movement of entities.
                        //(there is no perfect 2-d collision resolution system.)

                        //static-kinematic case.

                        if (pcA.isStatic() && !pcB.isStatic()) {
                            // TODO
                            //entity A is static, B is not, so move entity B to approprate position. (which effectively moves all its hitboxes)
                            resolveRectSolidityStaticKine(
                                pcA.getWorldXTopLeft(hA_index),
                                pcA.getWorldYTopLeft(hA_index),
                                hitA.width,
                                hitA.height,
                                pcB.getWorldXTopLeft(hB_index),
                                pcB.getWorldYTopLeft(hB_index),
                                hitB.width,
                                hitB.height,
                                pcB
                            )

                        } else if (!pcA.isStatic && pcB.isStatic()) {
                            resolveRectSolidityStaticKine(
                                pcB.getWorldXTopLeft(hB_index),
                                pcB.getWorldYTopLeft(hB_index),
                                hitB.width,
                                hitB.height,
                                pcA.getWorldXTopLeft(hA_index),
                                pcA.getWorldYTopLeft(hA_index),
                                hitA.width,
                                hitA.height,
                                pcA
                            )
                        }

                        //kine-kine
                        //more complex. choose the "heavier" one or the one with higher "priority"?

                    }

                    //Rectangle-Polygon case (Separating Axis Theorem)
                    // TODO

                    //Rectangle-circle case (No solidity resolution)
                    // TODO
                }
            }

        }
    }

}

/** Params represent rectangles of the static (s) and kinematic (k)
 * @param {PhysicsComponent} kinematicPC pass the p.c. of the kine so this function can actually change its position.
*/
function resolveRectSolidityStaticKine(xs, ys, ws, hs, xk, yk, wk, hk, kinematicPC) {
    debugger;
    //if static is further right than kine, calculate intersection with kine's width, otherwise calculate it other way
    let intersectionX = xs > xk ? xs - (xk + wk) : (xs + ws) - xk;
    //same but for if static is further down do it with kine's height etcc
    let intersectionY = ys > yk ? ys - (yk + hk) : (ys + hs) - yk;

    //smaller magnitude one wins
    if (Math.abs(intersectionX) < Math.abs(intersectionY)) {
        //shift in X
        kinematicPC.entityRef._x += intersectionX;
    } else {
        //shift in Y
        kinematicPC.entityRef._y += intersectionY;
    }


}
function twoRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {

    for (let i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] !== "number" || Number.isNaN(arguments[i])) {
            throw "rip";
        }

    }
    return (x1 < x2 + w2 &&
        x1 + w1 > x2 &&
        y1 < y2 + h2 &&
        h1 + y1 > y2);
}

// //"POST-SOLVE" move: Some collisions must move objects AFTER by setting "post-displacement". move them here based on that value
// function postStep() {

// }

/**
 * 
 */
function newOptions() {
    return new PhysicsOptions();
}

export { newOptions, addPhysicsComponent, updateAll, physicsComps as DEBUG_physicsComps }