import * as Engine from "../engine.js";
/*

future additions:
easy querying
raycast
regions that have physics effects.

*/

//The component of an entity that may make it move and handles collision with other entities.


//Used to be separated into two components (hitbox and kinematic) but when trying to implement clean collision handling,
//there resulted in too much coupling between the classes

//array because easier to iterate thru without duplicate checks when detecting collision, despite array have slower add/remove.

/**
 * property is the entity ID, value is the actual PhysicsComponent
 * @type {Object.<number, PhysicsComponent>}
 * //@type {Map<number, PhysicsComponent>}
 */
var physics_comps = {};
/**
 * Tracking how many physics components there are, so this must be updated every time physics_comps changes size
 */
var num_PCs = 0;

/**
 * number of cells the physics grid is horizonally, anything outside of the grid will not be iterated.
 */
const ENT_GRID_WIDTH_T = 6;
/**
 * grid should be small enough for performance and large enough for "idle" entities to be completely offscreen.
 */
const ENT_GRID_HEIGHT_T = 6;
/**
 * IN PIXELS (not accounting for zoom), this should be equal to tile size on tilemap, and is also the size of each cell on the entity collision grid
 */
var CELLSIZE = 16;
/**
 * if a cell has this many entities, more cannot be added to this cell, for performance reasons.
 * so may lead to weird behavior if too many in one cell.
 */
const ENT_MAX_PER_CELL = 10;

/**
 * object key is flattened x,y of cell starting from 0 to e_g_w/h_t, bucket is list of entities at that location on this frame
 * //outer arr is which column, inner arr is which cell, bucket is list of entities at that location on this frame
 * //@type {Array<Array<Bucket>>}
 * @type {Object.<number, Bucket>}
 * 
 * For now this will not include entities in negative coordinates.
 * MAY HAVE mulitple grids for each combination of types...
 */
var ent_grid = null;

// /**
//  * keep list of visited cells (the 2-D coord of the cell flattened to 1 number), so iterating thru the grid is faster when most cells are empty
//  * @type {Set<number>}
//  */
// let visitedCells = null;

/**
 * for handling collisions, use this to check if a collision pair (two hashed entity IDs) is already handled
 * @type {Set.<number>}
 */
var checked_pairs = new Set();

/**
 * an integer in cell coordinates, aka world coordinates divided by CELLSIZE, representing top left corner of the Entity grid
 * Also the grid is CLIPPED to the tilemap.
 */
var ent_grid_xMin_t = 0;

var ent_grid_yMin_t = 0;

/**@type {Function} */
var ent_grid_getCenter = null;


/**
 * 1-D array representing 2-D grid of TILE IDs
 */
var terrain_mapArr = null;


//TODO COULD BITMASK different combinations of square boundaries.
//like 0000 to 1111, being top,right,bottom,left respectively, 1 being solid in that direction 0 being nothing
//then collision can just check (type & 0001) or (type & 0010) etc to resolve specific edges.
/**
 * TOP means the tile has a collision edge at the top with a normal pointing UP
 * RIGHT means the tile has a collision edge on the right with a normal pointing RIGHT
 */
const terrain_wall_type = {
    SQUARE: 100,
    DOWN: 8,  //1000
    LEFT: 4, //0100
    UP: 2, //0010
    RIGHT: 1, //0001

    // TOP_RIGHT: 8,
    // BOTTOM_RIGHT: 9,
    // BOTTOM_LEFT: 10,
    // TOP_LEFT: 11
    // TOP_AND_LEFT: 13,
    // TOP_AND_RIGHT: 14,
    // BOTTOM_AND_LEFT: 15,
    // BOTTOM_AND_RIGHT: 16
}
/**
 * an object where: properties are the tile ID's, and the value is a Terrain Wall Type (number)
 * This CAN be modified over time, (e.g. breaking a wall) which should set edges to where static objects get added or removed.
 * 
 * @type {Object.<number,number>}
 */
var terrain_idData = null;

/**
 * the width of the tile map in tiles.
 */
var terrain_mapWidth = 0;

/**
 * Holds <capacity> number of numbers. The number "0" is not counted as data, rather the lack thereof.
 * The constructor initializes all to 0. Can only add, or "reset" (sets size to 0).
 * If at capacity and you try to add, the add will be ignored.
 * A bucket should always have nonzero numbers before zeros.
 * @param {number} capacity 
 */
function Bucket(capacity) {
    if (typeof capacity !== "number") {
        throw "WHAT R U DOIN";
    }
    this.capacity = capacity;
    this.size = 0;
    this.nums = {};
    for (let i = 0; i < capacity; i++) {
        this.nums[i] = 0;
    }
}
/**
 * Adds a number to the bucket. O(1).
 * Returns the index that the number is added to.
 * If at capacity and try to add, the add will be ignored.
 */
Bucket.prototype.add = function (num) {
    if (this.size >= this.capacity) {
        console.log("capacity full, didn't add");
        return;
    }
    this.nums[this.size] = num;
    this.size++;
    return this.size - 1;
}
/**
 * Gets a number given the index of the number to get. O(1)
 * Will THROW if attemptted to get outside the size. (because outside size may have old data)
 */
Bucket.prototype.get = function (index) {
    if (index >= this.size) {
        throw "RIP index oob";
    }
    return this.nums[index];
}
/**
 * Resets the size to 0, but the old data does not get removed. (It is meant to be overridden through later add()'s). O(1)
 */
Bucket.prototype.reset = function () {
    this.size = 0;
}




function PhysicsComponent(id) {
    if (typeof id !== "number") {
        throw "YES";
    }
    if (physics_comps[id]) {
        throw id + " already has a physicscomponent.";
    }
    this.entityID = id;
    this._hitbox = null; //Basically pointless without a hitbox.
    this._control = null; //function setting the velocity of this
    this._onCollide = null; //collision handling function for this entity.
    this._getCollisionData = null; //function that returns data for collision...

    //FOR NOW WE ARE NOT DOING SOLIDITY. BECAUSE TERRAIN IS SOLID. NO ENTITY IS. Any physical interaction with entities will be through "knockback-on-touch" rip
    //for now I can't think of an instance where making an entity like a solid block that can push other entities analog-ly is a good idea.
    //this.solid = 0; //solidity priority, 0 means not solid and just an "area" or "sensor", high number is "heavier" than lower number

    //add to physics_comps (map)
    physics_comps[id] = this;
    num_PCs++;
}
//initializer methods
PhysicsComponent.prototype.setRectangleHitbox = function (x, y, width, height) {
    this._hitbox = new AABBHitbox(x, y, width, height);
    return this;
}

/**
 * 
 * @param {Function} func collision handling function, with other pc's hitbox data passed in as first age
 */
PhysicsComponent.prototype.setOnCollideFunc = function (func) {
    if (typeof func !== "function") {
        throw "AAA";
    }
    this._onCollide = func;
    return this;
}

/**
 * @param {Function} func a function that returns, in the format {dx:#, dy:#}, the x vel and y vel of this entity on this frame.
 * If this function is successfully executed, it makes the hitbox assumed to be NOT STATIC! for now!
 */
PhysicsComponent.prototype.setControlFunc = function (func) {
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
 * e.g. get hit by projectile with 5 damage. the 5 needs to be sent to the recipient.
 * so pass in "function() {return damage;}" where damage was set to 5 in that context.
 * 
 */
PhysicsComponent.prototype.setCollisionDataFunc = function (func) {
    if (typeof func !== "function") {
        throw "AAA";
    }
    this._getCollisionData = func;
    return this;
}


//data retrieval methods
/**
 * Get the top left X coordinate of the AABB of this PC (any shape)
 */
PhysicsComponent.prototype.getAABBX = function () {
    if (this._hitbox) {
        return this._hitbox._xMin;
    }
}
PhysicsComponent.prototype.getAABBY = function () {
    if (this._hitbox) {
        return this._hitbox._yMin;
    }
}
PhysicsComponent.prototype.getAABBWidth = function () {
    if (this._hitbox) {
        return this._hitbox._width;
    }
}
PhysicsComponent.prototype.getAABBHeight = function () {
    if (this._hitbox) {
        return this._hitbox._height;
    }
}

function isPhysicsComponent(obj) {
    return obj instanceof PhysicsComponent;
}

/**
 * Rectangular hitbox that is aligned to the x and y axes (not rotated). The most basic and most common. Its AABB is itself.
 */
function AABBHitbox(x, y, width, height) {
    this._xMin = x;
    this._yMin = y;
    this._width = width;
    this._height = height;
}
// TODO
function CircleHitbox(xCenter, yCenter, r) {
    throw "Ooof";
    //same fields as aabbhitbox, but instead, refers to the AABB of the CIRCLE
    //aabb:
    this._xMin = xCenter - r / 2;
    this._yMin = yCenter - r / 2;
    this._width = r * 2;
    this._height = r * 2;

}

function create(entityID) {
    return new PhysicsComponent(entityID);
}
/**
 * does nothing if can't find
 * @param {number} entityID 
 */
function remove(entityID) {
    //physics_comps.delete(entityID);
    delete physics_comps[entityID];
    num_PCs--;
}

function get(entityID) {
    if (physics_comps[entityID] instanceof PhysicsComponent) {
        return physics_comps[entityID];
    }
    throw "That entity doesn't have a physics component, or has been removed.";
}


/** Initialize every cell to an array of 0's (default/invalid entity IDs)
 * Total RAM needed for the grid alone is width * height * maxpercell * sizeof_js_number
 * This has to be called exactly once. and the grid should only be modified not re-allocated ever.
 * 
 * Notes about the grid:
 * it will always have its top left at 0,0 UNLESS setGridCenterRef is set, then it will always follow that position.
 */
function initEntityGrid() {
    console.log("Init Grid start: " + Date.now());

    ent_grid = {};
    let i = 0, j = 0;
    for (i = 0; i < ENT_GRID_WIDTH_T; i++) {
        for (j = 0; j < ENT_GRID_HEIGHT_T; j++) {
            ent_grid[i + j * ENT_GRID_WIDTH_T] = new Bucket(ENT_MAX_PER_CELL);
        }
    }
    //visitedCells = new Bucket(ENT_GRID_WIDTH_T * ENT_GRID_HEIGHT_T);
    console.log("Init grid end: " + Date.now());
    debugger;
}

/**
 * Adds a static area to the WORLD.
 * TODO: use an algorithm to "smooth out" edges: e.g. add a wall on the left only if nothing is on the right
 */
function addStaticBox() {
    terrain_idData
}

/**
 * The only "call-every-frame" function relating to physics components...
 * 1. Moves all PC's based on its controller values.
 * 
 * Broad phase collision:
 * 2. update grid center, then adds every physicscomponent's entity ID to the grid by
 * adding its entityID to its appropriate location in the grid. (for now 1 entity has at most 1 hitbox)
 * 3. 
 */
function updateAll() {
    if (!ent_grid) {
        throw "Pls. initialize the entity grid with initEntityGrid or collision aint gonna happen";
    }
    //debugger;
    //MOVE & BROAD PHASE --------

    //set grid center to whatever the function returns to if it has the func, and snap to cellsize...
    if (typeof ent_grid_getCenter === "function") {
        //debugger;
        let wowo = ent_grid_getCenter(); //returns WORLD coordinates
        ent_grid_xMin_t = _worldToTilemapCoord(wowo.x) - Math.floor(ENT_GRID_WIDTH_T / 2); //this HAS To be an integer
        ent_grid_yMin_t = _worldToTilemapCoord(wowo.y) - Math.floor(ENT_GRID_HEIGHT_T / 2);
    }


    let ctr = null;
    let hitbox = null;
    let pc = null;

    //visitedCells.clear();

    //first: for each PC, check if it's completely within the grid bounds, then move it, then RESOLVE w/ terrain, then add it to grid based on its bounds after the move & resolve.

    //for (let i = 0; i < physics_comps.length; i++) {
    //physics_comps.forEach((pc, id, map) => {

    // TODO since world is likely going to be pretty big, only update a handful of the closest entities, and recalculate the handful not every frame but every 30 frames for example.
    for (const idStr in physics_comps) {
        //ARBITRARY ORDER - no guarantee it is in order of lower to highest id

        //const pc = physics_comps[i];
        pc = physics_comps[idStr];
        hitbox = pc._hitbox;

        if (!hitbox) {
            //didn't have a hitbox lol...
            continue;
        }
        //pc hitbox is WITHIN physics update area //TODO
        //IMPORTANT: hitbox must be fully within the bounds... will also check again before adding to entityGrid b/c this first check didn't account for the MOVE

        //debugger;
        if (hitbox._xMin >= ent_grid_xMin_t * CELLSIZE
            && hitbox._yMin >= ent_grid_yMin_t * CELLSIZE
            && hitbox._xMin + hitbox._width < (ent_grid_xMin_t + ENT_GRID_WIDTH_T) * CELLSIZE
            && hitbox._yMin + hitbox._height < (ent_grid_yMin_t + ENT_GRID_HEIGHT_T) * CELLSIZE) {


            //move it
            ctr = pc._control();
            hitbox._xMin += ctr.dx || 0;
            hitbox._yMin += ctr.dy || 0;

            /**
             * x coord of the MOVED pc in tilemap cell coords
             */
            let pc_x_min_tilemap = _worldToTilemapCoord(hitbox._xMin);
            let pc_y_min_tilemap = _worldToTilemapCoord(hitbox._yMin);
            let pc_x_max_tilemap = _worldToTilemapCoord(hitbox._width + hitbox._xMin);
            let pc_y_max_tilemap = _worldToTilemapCoord(hitbox._height + hitbox._yMin);

            //SOLID TERRAIN RESOLUTION - before even adding it to entity grid, first ensure no (rectangular) entity goes past a wall!
            //by checking the bounding cells it's in.

            //only handling rectangular hitboxes for now.
            if (!(hitbox instanceof AABBHitbox)) {
                continue;
            }
            //mapArr needs to be set so theres a terrain to collide and resolve with
            //or else just skip to directly adding to grid (tilesize is at default 16)
            if (terrain_mapArr) {
                //er;


                let tileID;
                let idData = 0;
                let numWallsTop = 0;
                let numWallsRight = 0;
                let numWallsBot = 0;
                let numWallsLeft = 0;
                let tx = 0, ty = 0;

                //check all bounding cells for solid terrain:
                //>2 SQUARES on a side means immediately move it & done. (for now -- algorithm can be improved)
                //>2 squares on any side means move it 
                //debugger;
                boundingCellLoop:
                for (tx = pc_x_min_tilemap; tx <= pc_x_max_tilemap; tx++) {
                    for (ty = pc_y_min_tilemap; ty <= pc_y_max_tilemap; ty++) {

                        //only check edge/corner cells...
                        if (tx > pc_x_min_tilemap && tx < pc_x_max_tilemap && ty > pc_y_min_tilemap && ty < pc_y_max_tilemap) {
                            continue;
                        }

                        idData = terrain_idData[terrain_mapArr[tx + terrain_mapWidth * ty]];

                        if (!idData) {
                            //id doesn't have any solidity data
                            continue;
                        }
                        //debugger;

                        switch (idData) {

                            //line cases: resolve NOW in respective direction, while checking it is actually inthat direction
                            case terrain_wall_type.DOWN:
                                if (ty === pc_y_min_tilemap) {
                                    //push down
                                    hitbox._yMin = (pc_y_min_tilemap + 1) * CELLSIZE;
                                }
                                break;
                            case terrain_wall_type.RIGHT:
                                if (tx === pc_x_min_tilemap) {
                                    //push right
                                    hitbox._xMin = (pc_x_min_tilemap + 1) * CELLSIZE;
                                }
                                break;
                            case terrain_wall_type.LEFT:
                                if (tx === pc_x_max_tilemap) {
                                    //push left
                                    hitbox._xMin = pc_x_max_tilemap * CELLSIZE - hitbox._width - 0.01; //tiny amount to avoid persistent collision
                                }
                                break;
                            case terrain_wall_type.UP:
                                if (ty === pc_y_max_tilemap) {
                                    //push up
                                    hitbox._yMin = pc_y_max_tilemap * CELLSIZE - hitbox._height - 0.01;
                                }
                                break;
                            case terrain_wall_type.DOWN | terrain_wall_type.LEFT:
                                // |__
                                if (ty === pc_y_min_tilemap || tx === pc_x_max_tilemap) {
                                    //correct location rel to player


                                    //check whether intersecting the topwall or the rightwall is greater disp. (make sure both are positive numbers)
                                    
                                    if ((ty + 1) * CELLSIZE - hitbox._yMin < hitbox._xMin + hitbox._width - (tx) * CELLSIZE) {
                                        //top won (is smaller) (Default) so push down
                                        hitbox._yMin = (pc_y_min_tilemap + 1) * CELLSIZE;
                                    } else {
                                        //right won so push left
                                        hitbox._xMin = pc_x_max_tilemap * CELLSIZE - hitbox._width - 0.01;
                                    }

                                    
                                }
                                break;
                            case terrain_wall_type.DOWN | terrain_wall_type.RIGHT:
                                //  __|

                                if (ty === pc_y_min_tilemap || tx === pc_x_min_tilemap) {
                                    if ((ty + 1) * CELLSIZE - hitbox._yMin < (tx + 1) * CELLSIZE - hitbox._xMin) {
                                        //top won (is smaller) so push down
                                        hitbox._yMin = (pc_y_min_tilemap + 1) * CELLSIZE;
                                    } else {
                                        //left won, so push right
                                        hitbox._xMin = (pc_x_min_tilemap + 1) * CELLSIZE;
                                    }
                                }
                                break;
                            case terrain_wall_type.UP | terrain_wall_type.LEFT:
                                //  __
                                // |
                                if (ty === pc_y_max_tilemap || tx === pc_x_max_tilemap) {
                                    if (hitbox._yMin + hitbox._height - (ty) * CELLSIZE < hitbox._xMin + hitbox._width - (tx) * CELLSIZE) {
                                        //bottom won (is smaller) so push up
                                        hitbox._yMin = pc_y_max_tilemap * CELLSIZE - hitbox._height - 0.01;
                                    } else {
                                        //right won so push left
                                        hitbox._xMin = pc_x_max_tilemap * CELLSIZE - hitbox._width - 0.01;
                                    }
                                }
                                break;
                            case terrain_wall_type.UP | terrain_wall_type.RIGHT:
                                // __
                                //   |
                                if (ty === pc_y_max_tilemap || tx === pc_x_min_tilemap) {
                                    if (hitbox._yMin + hitbox._height - (ty) * CELLSIZE < (tx + 1) * CELLSIZE - hitbox._xMin) {
                                        //bottom won (is smaller) so push up
                                        hitbox._yMin = pc_y_max_tilemap * CELLSIZE - hitbox._height - 0.01;
                                    } else {
                                        //left won so push right
                                        hitbox._xMin = (pc_x_min_tilemap + 1) * CELLSIZE;
                                    }
                                }
                                break;
                        }
                    }
                    //end bounding cell loop
                }
                //END SOLIDITY RESOLUTION
            }


            //START ADDING TO ENTITY GRID (has different bounds than tilemap if not at 0,0)
            //add the entity (ID) into the grid based on its AABBs. (hitbox's xMin, yMin, width, height)

            let pc_x_min_ent_grid = _worldToEntGridX(hitbox._xMin);
            let pc_y_min_ent_grid = _worldToEntGridY(hitbox._yMin);
            let pc_x_max_ent_grid = _worldToEntGridX(hitbox._width + hitbox._xMin);
            let pc_y_max_ent_grid = _worldToEntGridY(hitbox._height + hitbox._yMin);

            let entBucket;
            let tx = 0, ty = 0;
            //for each cell that PC (which is completely within the physics bounds) is in, add it to respective bucket.
            pcAddGrid:
            for (tx = pc_x_min_ent_grid; tx <= pc_x_max_ent_grid; tx++) {
                for (ty = pc_y_min_ent_grid; ty <= pc_y_max_ent_grid; ty++) {
                    //do not add negative coords???
                    //not sure what to do with negative coords...
                    if (tx < 0 || ty < 0) {
                        console.log("NEGATIVE COORDS");
                        continue;
                    }
                    //debugger;
                    //currCell = ent_grid[tx][ty]; 
                    entBucket = ent_grid[tx + ty * ENT_GRID_WIDTH_T]//cell pos (flattened) relative to the ENT GRID!
                    if (!entBucket) {
                        console.log("one part of entity " + idStr + " moved outside of physArea while it was inside it before move, not adding part to grid");
                        continue;
                    }

                    // //first, clear the bucket if this cell HASN'T been visited on this frame yet
                    // //this is to avoid adding to old data
                    // if (!visitedCells.has(currCell)) {
                    //     entBucket.reset();
                    // }

                    //bucket will be cleared AFTER handled.
                    //entBucket = ent_grid[currCell];
                    //entBucket.add(pc.entityID);
                    entBucket.add(parseInt(idStr));
                    //visitedCells.add(currCell); //adds duplicates, BAD
                }
            }
            //added to grid

            //end if in update area
        } else {
            //console.log(idStr + " NOT IN AREA");
        }


        // //end of physiccomps.forEach for solidity resolution
        //});

        //end iterating physicsComps
    }
    //solidity resolution done, & all entities in update area added to grid
    //Entities will STAY PUT for the rest of the step from here on.

    //For each visited cell, only if theres >=2 ents in them, brute force check them then narrow phase collision 
    //for the cell after everything inside it is handled, CLEAR the bucket

    /**
     * @type {Bucket}
     */
    let entBucket;
    let cellCol;
    //for (let i = 0; i < visitedCells.size; i++) {
    //  entBucket = ent_grid[visitedCells.get(i)];

    //FOR EACH CELL! (should have no big memory allocs, and smooth for any reasonable number of ents) (but wastes cpu cycles b/c ALWAYS checks ALL cells (default 2,500)
    for (let i = 0; i < ENT_GRID_WIDTH_T; i++) {
        //cellCol = ent_grid[i];
        for (let j = 0; j < ENT_GRID_HEIGHT_T; j++) {
            entBucket = ent_grid[i + j * ENT_GRID_WIDTH_T];
            if (entBucket.size >= 2) {
                //2 or more entities have collided together in the BROAD PHASE.

                let a = 0, b = 0;
                let hash = 0;
                let pcA, pcB;
                let idA, idB;

                //brute force all the entities in this cell (bucket) with each other
                for (a = 0; a < entBucket.size; a++) {
                    for (b = a + 1; b < entBucket.size; b++) {
                        idA = entBucket.get(a);
                        idB = entBucket.get(b);
                        hash = _cantorHash_unordered(idA, idB); //hash the ID combination
                        if (checked_pairs.has(hash)) {
                            //ignore pair that has already been checked
                            continue;
                        }
                        // pcA = physics_comps.get(idA);
                        // pcB = physics_comps.get(idB);
                        pcA = physics_comps[idA];
                        pcB = physics_comps[idB];
                        //assume both are rect FOR NOW

                        //check for narrow-phase collision using AABB Intersection alg
                        if (_twoRectCollision(
                            pcA._hitbox._xMin, pcA._hitbox._yMin,
                            pcA._hitbox._width, pcA._hitbox._height,
                            pcB._hitbox._xMin, pcB._hitbox._yMin,
                            pcB._hitbox._width, pcB._hitbox._height,
                        )) {
                            //NARROW PHASE PASSED!!!
                            //debugger;
                            if (pcA._onCollide) {
                                pcA._onCollide(pcB._getCollisionData ? pcB._getCollisionData() : null);
                            }
                            if (pcB._onCollide) {
                                pcB._onCollide(pcA._getCollisionData ? pcA._getCollisionData() : null);
                            }
                            //call onCollide for entities in question.
                            //handle everything b/t the two
                            // TODO on collision "start" and "end" like in box2d...
                        }

                        //add the pair if it was checked regardless of successful intersect.
                        checked_pairs.add(hash);
                    }
                }
                //endif found >=2 ents
            }
            //CLEAR the bucket so its values dont interfere with next frame
            entBucket.reset();

            //end foreach cell inner loop
        }
        // end foreach cell outer loop
    }

    //clear the list of visited cells so next frame can re-write these cleanly
    //visitedCells.reset();

    //clear this too since pairs that collided have no (little) relation between frames
    checked_pairs.clear();


}

/**
 * returns UNIQUE int given 2 ints, but order of the 2 ints does NOT matter.
 */
function _cantorHash_unordered(numA, numB) {
    if (numA > numB) {
        return (numA + numB) * (numA + numB + 1) / 2 + numB;
    } else {
        return (numA + numB) * (numA + numB + 1) / 2 + numA;
    }
}

/**
 * Please include all numbers.
 */
function _twoRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (x1 < x2 + w2 &&
        x1 + w1 > x2 &&
        y1 < y2 + h2 &&
        h1 + y1 > y2);
}

/**
 * All numbers. 1 and 2 are the first line, 3 and 4 are the second line
 * @return the point of intersection or false
 */
function _lineLineColl(x1, y1, x2, y2, x3, y3, x4, y4) {
    // calculate the distance to intersection point
    let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {

        // optionally, draw a circle where the lines meet
        let intersectionX = x1 + (uA * (x2 - x1));
        let intersectionY = y1 + (uA * (y2 - y1));

        return { x: intersectionX, y: intersectionY };
    }
    return false;
}

function _midpoint(x1, y1, x2, y2) {
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}



// /**
//  * given coordinates in tiles, check the data of that tile.
//  */
// function _checkTerrainData(x, y) {
//     return terrain_idData[terrain_mapArr[x + terrain_mapWidth * y]];
// }

/**
 * converts a world coord to ENTITY GRID CELL COORDS.
 * Assume the entity grid has its top-left at e_g_x_t and e_g_y_t, is "snapped" to the tilesize of the tilemap
 */
function _worldToEntGridX(x) {
    return Math.floor((x - ent_grid_xMin_t * CELLSIZE) / CELLSIZE);
    //return Math.floor(x / CELLSIZE) + ent_grid_xMin_t;
}
function _worldToEntGridY(y) {
    return Math.floor((y - ent_grid_yMin_t * CELLSIZE) / CELLSIZE);
    //return Math.floor(y / CELLSIZE) + ent_grid_yMin_t;
}

/**
 * converts a world coord to WORLD CELL coordinates of the TERRAIN (tilemap)
 * because the tilemap starts at ZERO world coords
 * 
 * ex is size=16, then like 31.9999 will be 1, 16.000 will be 1
 */
function _worldToTilemapCoord(num) {
    return Math.floor(num / CELLSIZE);
}

/**
 * had to keep a size variable for O(1)
 */
function getCount() {
    return num_PCs;
}

/**
 * Set a solid collision "map" related to the tilemap, where certain IDs on the tilemap array actually refer to "solid" cells, OR lines.
 * This is necessary for entities to have solid collision with tiles on a tilemap
 * @param mapArr an array of TILE ID's
 * @param {Object.<number, number>} idData an object where: properties are the tile ID's, and the value is a Terrain Wall Type (number)
 * @param mapWidth width of the mapArr in TILES
 * @param tileSize usually 16. if not, the physics will also align with the given tilesize
 */
function setTerrainMap(mapArr, idData, mapWidth, tileSize) {
    terrain_mapArr = mapArr;
    terrain_idData = idData;
    terrain_mapWidth = mapWidth;
    CELLSIZE = tileSize || CELLSIZE;
}

/**
 * This is usually a function that always returns the player's center x and y coordinates
 * @param {Function} func A function that returns, in the format {x: #, y: #},
 * the WORLD x and WORLD y for the CENTER of the grid to snap to, but the grid will only snap to TILE_SIZE intervals.
 */
function setGridCenterRef(func) {
    ent_grid_getCenter = func;
}


//debug rendering: drawing hitboxes and terrain
/**
 * Draws all AABBs and Terrain lines/squares on screen.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {} camera
 * @param {number} screenWidth the width of the game viewport in REAL Pixels
 * 
 */
function drawDebug(ctx, camera, screenWidth, screenHeight) {
    ctx.save();
    ctx.fillStyle = "rgba(154,137,243,0.8)";
    let zoom = Engine.ZOOM;

    //draw entities' AABBs on screen (only checking the top left corner lol)
    //and also the cells that the AABBs touch (TODO?)
    let scx = 0, scy = 0, scw = 0, sch = 0;
    let pc;
    for (const idStr in physics_comps) {
        pc = physics_comps[idStr];
        scx = (pc.getAABBX() - camera.getExactX()) * zoom;
        scy = (pc.getAABBY() - camera.getExactY()) * zoom;
        scw = pc.getAABBWidth() * zoom;
        sch = pc.getAABBHeight() * zoom;
        if (scx >= 0 && scy >= 0 && scx < screenWidth && scy < screenHeight) {
            ctx.fillRect(
                scx,
                scy,
                scw,
                sch
            );
        }
    }

    ctx.fillStyle = "rgba(200,0,0,0.8)";
    ctx.strokeStyle = 'rgb(0,0,200)';
    ctx.lineWidth = 2;
    //draw Terrain boxes on screen
    //loop thru all tiles that are on screen and check all
    let tx = 0, ty = 0;
    let tileID = 0;
    let data = 0;

    let xi = Math.floor(camera.getExactX() / CELLSIZE), //these 4 are in units of tiles.
        xf = Math.ceil((camera.getExactX() + screenWidth / zoom) / CELLSIZE), //need to divide canvas width by ZOOM.
        yi = Math.floor(camera.getExactY() / CELLSIZE),
        yf = Math.ceil((camera.getExactY() + screenHeight / zoom) / CELLSIZE);
    for (tx = xi; tx < xf; tx++) {
        if (tx < 0) {
            continue;
        }
        for (ty = yi; ty < yf; ty++) {
            if (ty < 0) {
                continue;
            }
            tileID = terrain_mapArr[tx + ty * terrain_mapWidth];
            scx = (tx * CELLSIZE - camera.getExactX()) * zoom;
            scy = (ty * CELLSIZE - camera.getExactY()) * zoom;
            data = terrain_idData[tileID];
            //switch () {
            // case terrain_wall_type.SQUARE:
            //     ctx.beginPath();
            //     ctx.rect(scx, scy, CELLSIZE * zoom, CELLSIZE * zoom);
            //     ctx.stroke();
            //     //ctx.fillRect(scx, scy, CELLSIZE * zoom, CELLSIZE * zoom);
            //     break;
            //case terrain_wall_type.TOP:
            if (data & terrain_wall_type.DOWN) {
                //may be inefficient as it draws lines individually but some may not be connected so...
                ctx.beginPath();
                ctx.moveTo(scx, scy + CELLSIZE * zoom);
                ctx.lineTo(scx + CELLSIZE * zoom, scy + CELLSIZE * zoom); //draw line 1 cellsize long
                ctx.stroke();
            }
            //break;
            //case terrain_wall_type.RIGHT:
            if (data & terrain_wall_type.LEFT) {
                ctx.beginPath();
                ctx.moveTo(scx, scy);
                ctx.lineTo(scx, scy + CELLSIZE * zoom);
                ctx.stroke();
            }
            // break;
            //case terrain_wall_type.BOTTOM:
            if (data & terrain_wall_type.UP) {
                ctx.beginPath();
                ctx.moveTo(scx, scy);
                ctx.lineTo(scx + CELLSIZE * zoom, scy);
                ctx.stroke();
            }
            //break;
            //case terrain_wall_type.LEFT:
            if (data & terrain_wall_type.RIGHT) {
                ctx.beginPath();
                ctx.moveTo(scx + CELLSIZE * zoom, scy);
                ctx.lineTo(scx + CELLSIZE * zoom, scy + CELLSIZE * zoom);
                ctx.stroke();
            }
            //break;
            //case terrain_wall_type.BOTTOM_RIGHT:
            // if (data & terrain_wall_type.TOP) {
            //     ctx.beginPath();
            //     ctx.moveTo(scx + CELLSIZE * zoom, scy);
            //     ctx.lineTo(scx, scy + CELLSIZE * zoom);
            //     ctx.stroke();
            // }
            //break;
        }
    }

    ctx.strokeStyle = "black";

    scx = (ent_grid_xMin_t * CELLSIZE - camera.getExactX()) * zoom;
    scy = (ent_grid_yMin_t * CELLSIZE - camera.getExactY()) * zoom;
    //draw outline of grid...
    ctx.beginPath();
    ctx.rect(scx, scy, ENT_GRID_WIDTH_T * CELLSIZE * zoom, ENT_GRID_HEIGHT_T * CELLSIZE * zoom);
    ctx.stroke();


    ctx.restore();
}



export {
    create, remove, get,
    initEntityGrid, updateAll, setTerrainMap, setGridCenterRef, terrain_wall_type, drawDebug, getCount,
    isPhysicsComponent
};