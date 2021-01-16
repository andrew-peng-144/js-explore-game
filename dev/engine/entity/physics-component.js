import * as Engine from "../engine.js";
import { TILE_SIZE } from "../../modules/mysettings.js";
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
    //this._onCollide = null; //collision handling function for this entity.
    //this._getCollisionData = null; //function that returns data for collision...
    this._postMove = null;

    this._active = true; //whether this will have its collisions checked or not. pc can still move tho.
    this._freeflow = false; //whether this can just pass thru terrain

    //?? below... we could actually still do it lmao.
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
//TODO implement these shapes
PhysicsComponent.prototype.setPolyShapeHitbox = function () {
    //for setting a hitbox to be multiple shapes.
    alert("w");
}

PhysicsComponent.prototype.setCircleShapeHitbox = function () {
    alert("w.");
}

//TODO may be better to not have "setControlFunc", and instead just have setters and getters for velocity.
//This is because the movement patterns should depend on the entity Type, and each entity of a certain type usually
//should have similar controlling of their velocities.
//Having each entity have its own control func regardless of type implies that movement and type are uncorrelated which shouldn't be the case.
/**
 * @param {Function} func a function that returns, in the format {dx:#, dy:#}, the x vel and y vel of this entity on this frame.
 * If this function is successfully executed
 */
PhysicsComponent.prototype.setControlFunc = function (func) {
    if (typeof func !== "function") {
        throw "AAA";
    }
    this._control = func;
    return this;
}

/**
 * Sets a function that gets called every update, with the displacement of the entity (including solidity resolution) passed in as the 1st and 2ng arg as dx and dy.
 */
PhysicsComponent.prototype.setPostMoveUpdate = function (func) {
    if (typeof func !== "function") {
        throw "AAA";
    }
    this._postMove = func;
    return this;
}

/** sets whether this physics component will be checked for collision with other pc's. default is true. */
PhysicsComponent.prototype.setActive = function (bool) {
    this._active = bool;
    return this;
}
PhysicsComponent.prototype.setFreeflow = function (bool) {
    this._freeflow = bool;
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
    if (physics_comps[entityID]) {
        delete physics_comps[entityID];
        num_PCs--;
    } else {
        console.log("REMOVE FAILED");
    }
}

function get(entityID) {
    if (physics_comps[entityID] instanceof PhysicsComponent) {
        return physics_comps[entityID];
    }
    throw "That entity doesn't have a physics component, or has been removed.";
}



//COLLISION CHECKING -------------------------------------------------------------------------------

/**
 * number of cells the physics grid is horizonally, anything outside of the grid will not be iterated.
 */
const ENT_GRID_WIDTH_T = 10;
/**
 * grid should be small enough for performance and large enough for "idle" entities to be completely offscreen.
 */
const ENT_GRID_HEIGHT_T = 5;
/**
 * IN PIXELS (not accounting for zoom), this is the size of each cell on the entity collision grid. This may be equal to the tile size. Or a integer multiple of it.
 */
var ENT_CELLSIZE = 32;



/**
 * if a cell has this many entities, more cannot be added to this cell, for performance reasons.
 * so may lead to weird behavior if too many in one cell.
 */
const ENT_MAX_PER_CELL = 5;

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
 * for handling collisions, use this to check if a collision pair (two hashed entity IDs) is already handled in this frame.
 * @type {Set.<number>}
 */
var checked_pairs = new Set();

/**
 * for tracking whether a collision just happened between two specific entities, and when they stopped colliding.
 * 
 * number is the hash
 * 
 * boolean is "mark": when a pair is found for the first time, it gets added to this, then marked true.
 * Then remove all pairs already in the list (from the prev frame) that are still false.
 * Then set all pairs to false.
 * if the pair is found on the next frame, it will get marked back to true.
 * but if the pair is not found (it didn't get marked true), then it's false, so then remove from this, and call the onexit method
 * @type {Map.<number,boolean>}
 */
var collided_pairs = new Map();

// /**
//  * holds the pairs that collided on this frame. This along with prev_c_p is used in order to know when two objects collided the first time, middle, or exited.
//  * @type {Set.<number>}
//  */
// var curr_collided_pairs = new Set();
// /**
//  * holds the pairs that collided on the previous frame
//  * @type {Set.<number>}
//  */
// var prev_collided_pairs = new Set();

/**
 * an integer in cell coordinates, aka world coordinates divided by CELLSIZE, representing top left corner of the Entity grid
 * Also the grid is CLIPPED to the tilemap.
 */
var ent_grid_xMin_t = 0;

var ent_grid_yMin_t = 0;

/**@type {Function} */
var ent_grid_getCenter = null;


// /**
//  * Large 1-D array representing 2-D grid of TILE IDs, which represents what the map visually looks like. This array spans the entire map.
//  */
// var terrain_mapArr = null;


//////ignore the comment below. Doing old method again.
/////////////// : this file does not depend on the visual tilemap itself anymore. Instead it has addsurface methods that are snapped to a grid
/////////////// meaning that instead of the oustide code setting the terrain_maparr, it will instead set a terrain_tilesize, grid width and height.
/////////////// so the visuals of th etilemap are irrelevant within this file. Outside, it will read from the visual map and spam addsurface calls to build the physical terrain.
///////////////////// so need to remove terrain_maparr and replace with above. also dont need a lot of other stuf



// /**
//  * Large array of arrays representing 2-D grid of SURFACES, which represents the environment that pc's cannot pass through. This array spans the entire map.
//  * 
//  * t_s_d's entries are either: null, a number, or a array of Surface objects. So it's a mixed array.
//  * 
//  * Structure of t_s_d is something like: [...null, Number, Number, null, [Surface, Surface], null, [Surface], null, ... [Surface], ... ]
//  * 
//  * null entry means nothing is at that cell.
//  * 
//  * number entry means the cell has a simple surface occupied in it, which is a surface that's aligned to the gridlines and is 1 gridwidth long.
//  * 
//  * array of surfaces as an entry means its a complex cell that may contain many surfaces (of any length and direction) whose bounding boxes may overlap that cell.
//  * 
//  * Maps can have millions of tiles so this should be efficient.
//  * Upon map load (or before deployment?), it converts all the surfaces from the map data to t_s_d format (calculate which indeces in t_s_d each surface is at).
//  * This calculation prepares t_s_d so each frame, each entity checks surfaces ONLY IN ITS CELL(S) instead of checking all surfaces.
//  * 
//  * Collision phase checks if a pc intersects with a surface, by checking if a surface is in one of the same cells as the pc.
//  * 
//  * Note that this array, since it has mixed data, is not in continguous block of memory. Iterating thru it is quite slow (we won't iterate all frequently). But accessing is still fast
//  * 
//  * @type {Array}
//  */
// var terrain_solid_data = null;

//TODO STATIC!!!!!!!!!!!!!!!!
//Static PC's should be added to some static grid (like terrain_mapArr) that DOESN'T CHANGE (or rarelt- can "break a block")
//and any non-static PC can just check neighboring cells, then narrow phase to resolve

// /**
//  * TOP means the tile has a collision edge at the top with a normal pointing UP
//  * RIGHT means the tile has a collision edge on the right with a normal pointing RIGHT
//  */
// const terrain_wall_type = {
//     SQUARE: 100,
//     DOWN: 8,  //1000
//     LEFT: 4, //0100
//     UP: 2, //0010
//     RIGHT: 1, //0001

//     // TOP_RIGHT: 8,
//     // BOTTOM_RIGHT: 9,
//     // BOTTOM_LEFT: 10,
//     // TOP_LEFT: 11
//     // TOP_AND_LEFT: 13,
//     // TOP_AND_RIGHT: 14,
//     // BOTTOM_AND_LEFT: 15,
//     // BOTTOM_AND_RIGHT: 16
// }
// /**
//  * an object where: properties are the tile ID's, and the value is a Terrain Wall Type (number)
//  * 
//  * @type {Object.<number,number>}
//  */
// var terrain_idData = null;




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


/** Initialize every cell to an array of 0's (default/invalid entity IDs)
 * Total RAM needed for the grid alone is approx, or proportional to: width * height * maxpercell * sizeof_js_number
 * This has to be called exactly once. and the grid should only be modified not re-allocated ever.
 * 
 * Notes about the entity grid:
 * it's a region of the map where only the entities inside it will receive updates. It should follow the player; the player should be in the center.
 * it will have its top left at 0,0 UNLESS setGridCenterRef is set, then it will always follow that position.
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

// Unneeded for now because solid objects are all handled on creation not dynaically
// /**
//  * Adds a static, SOLID area to the WORLD, but will SNAP to the tilemap grid.
//  * @param {Number} wx The WORLD x-coord of the area to make static & solid
//  * @param {Number} wy The WARUDO y-coord
//  * @param {Number} width the width of the area to add in world scale (pixels not accounting for zoom)
//  * TODO: use an algorithm to "smooth out" edges: e.g. add a right-wall only if nothing is on the right
//  */
// function setStaticBox(wx, wy, width = CELLSIZE, height = CELLSIZE) {
//     //directly modify the terrain data to now have this new location be static
//     let tx = _worldToTilemapCoord(wx);
//     let ty = _worldToTilemapCoord(wy);
//     for (let i = 0; i < width / CELLSIZE; i++) {
//         for (let j = 0; j < height / CELLSIZE; j++) {
//             terrain_idData[(tx + i) + terrain_mapWidth * (ty + j)] = 15; //0b1111 (square) (for now) (will have sticky corners)

//         }
//     }
// }

// function C_Surface(x1, y2, x2, y2, rev) {
//     this.x1 = x1;
//     this.y1 = y1;
//     this.x2 = x2;
//     this.y2 = y2;
//     this.rev = rev;
// }

//////////Prob will replace the below with adding full solid shapes instead of arbitrary one-way surfaces
// /**
//  * Add surface of any direction and length. 
//  * @param {*} rev bool, false to have the surface resolve up and left, true for down and right
//  */
// function terrain_add_complex_surface(x1, y1, x2, y2, rev) {
//     //normal vector defaults to up and left, rev flips it

//     //calculate which cell(s) to place this surface refernece into.

//     let sur_x_min = _worldToEntGridX(x1); //x1 converted to the x position on the tsd grid (same bounds as ent grid), in cells.
//     let sur_y_min = _worldToEntGridY(y1); // x2 "
//     let sur_x_max = _worldToEntGridX(x2);
//     let sur_y_max = _worldToEntGridY(y2);

//     //Note that there's an inefficiency not accounted for, that gets worse with larger surfaces.
//     //Because this adds the entier bounding rectangle of cells, not just the cells the line actually goes thru.
//     //Not an issue for surfaces shorter than cell, or surface is clipped to the gridlines.
//     //ex: a diagonal surface that actually intersects only 7 cells, may end up having 16 cells added.
//     //This inefficiency persists during game updates as well because entities think they're in the same cell as a long diagonal surface while its stil far from it

//     let tx = 0, ty = 0;

//     let cell_index = 0;

//     //for each cell that the surface intersects (surface's bounding box), add that surface to the cell.
//     for (tx = sur_x_min; tx <= sur_x_max; tx++) {
//         for (ty = sur_y_min; ty <= sur_y_max; ty++) {

//             cell_index = tx + ty * terrain_mapWidth; //index of the cell of the terrain to add
//             if (terrain_solid_data[cell_index] === null) {
//                 //create an array there if it was null. (could also check if not an array instead.)
//                 terrain_solid_data[cell_index] = new Array();
//             }
//             terrain_solid_data[cell_index].push(new C_Surface(x1, y1, x2, y2, rev));
//         }
//     }

// }


/////////////////////////// Solid terrain ////////////////////

// /**
//  * Array of numbers. Represents the environment that pc's can't pass through.
//  * Number less than 16: unsigned 4 bit top,right,down,left edge is active.
//  * 16,17,18,19: diagonals starting from topleft and clockwise
//  * 
//  */
// var terrain_surface_data = null;

var terrain_mapArr = null;

/**
 * Number less than 16: unsigned 4 bit top,right,down,left edge is active.
 * 16,17,18,19: diagonals starting from topleft and clockwise
 */
var terrain_id2sur = null;

//var terrain_mapHeight = 0;
/**
 * the width of the tile map in tiles.
 */
var terrain_mapWidth = 0;

/**
 * IN PIXELS (not accounting for zoon), the size of a tile on the terrain
 */
var TERRAIN_TILESIZE = 16;

// though ti was doing this, then went back to old method where we set the tilemap directly here. 
///**
//  * Set the terrain map, the ID-to-surface conversion table, width of map, and tile size.
//  * @param {*} mapWidth width of the tilemap in tiles
//  * @param {*} mapHeight 
//  * @param {*} tileSize num of pixels per tile
//  */
// function setTerrainMapBounds(mapWidth, mapHeight, tileSize = 16) {

//     //init t_s_d as large 1-D array of 0's.
//     terrain_surface_data = new Array();
//     for (let i = 0; i < mapWidth * tileSize; i++) {
//         for (let j = 0; j < mapHeight * tileSize; j++) {
//             terrain_surface_data[j + i * tileSize] = 0;
//         }
//     }

//     terrain_mapWidth = mapWidth;
//     terrain_mapHeight = mapHeight;
//     TERRAIN_TILESIZE = tileSize;
// }

//Not doing below anymore, instead setting entire tilemap and a map from tileid to surface
// /**
//  * Define a cell, aligned with the tilemap, to enclose one or more surfaces that are either aligned to the top edge, right, bot, or left.
//  * 
//  * @param {*} cellX 0-indexed which cell on the x axis will this surface be placed
//  * @param {*} cellY 
//  * @param {*} num If unsigned 4 bit number, e.g. 1010, representing which sides are solid surfacez: top right down left. If 16,17,18,19: diagonals starting from topleft and clockwise
//  */
// function terrain_add_surface(cellX, cellY, num) {
//     if (!terrain_surface_data) {
//         throw "Terrain map bounds needs to be set, before defining surfaces on map."
//     }


//     if (cellX < 0 || cellY < 0) {
//         throw "Cannot have negative indexes for cells."
//     }
//     if (cellX >= terrain_mapWidth) {
//         throw "cellX is out of bounds."
//         //needs to be checked or else out-of-bounds cellX's won't cause error because it may point to a good cell.
//     }
//     if (!Number.isInteger(num) || num < 1 || num > 19) {
//         throw "needs to be an integer between 1 and 19 inc"
//     }

//     let cell_index = cellX + cellY * terrain_mapWidth;
//     let data = terrain_surface_data[cell_index];

//     if (data === undefined) {
//         throw "Cannot set a simple surface on a cell that's out of bounds.";
//     }
//     if (data === null) {
//         //good that means we can set the value
//         terrain_surface_data[cell_index] = num;
//     }

//     //TODO: remove solid edge if both cells next to the edge have that edge marked as solid. So the wall there remains smooth.
// }


//////////////////// Update method & helpers ///////////////////////////

/**
 * Resolve the given pc with the static map terrain.
 * 
 * only used by updateAll while its looping thru each ent
 * @param {PhysicsComponent} pc 
 * @param {AABBHitbox} hitbox 
 */
function _update_resolve_terrain(pc, hitbox) {
    //freeflow dont solidly handle with terrain.
    if (pc._freeflow) {
        if (typeof pc._postMove === "function") {
            pc._postMove(hitbox._xMin - pcOldX, hitbox._yMin - pcOldY);
        }//sigh. just copy pasted thjis from the end...
        return;
    }



    //SOLID TERRAIN RESOLUTION - before even adding it to entity grid, first move entities to stop colliding with a surface.
    //by checking the bounding cells it's in.
    //note that solid terrain definitions are aligned on the tilemap, not the entity grid.



    //RECT ONLY FOR NOW:
    //At this point in the code the hitbox must be rectangular.


    // //mapArr needs to be set so theres a terrain to collide and resolve with
    // //or else just skip to directly adding to grid (tilesize is at default 16)
    // if (!terrain_mapArr) {
    //     console.log("physics system does not have a tilemap associated with it");
    //     return;
    // }
    //NOTE: dont need the above because t_maparr is aesthetics only since the surface adding and parsing happens in addsurface methods.

    //map arr exists. lets resolve each entity from the surface using n-reso

    let tx = 0, ty = 0;
    let min_res; //minimum resolution amount.
    let min_res_dir = null; //the direction, in degrees inverted-y, 0 to 359.99, corresponding to the min res amount

    //for each of the pc's border cells, check if any overlap a surface.

    //let first_dir = null; //angle of resolution on the first run
    let prev_tile = null; //the index in t_mapArr of the tile that resolved in the previous run (first run)
    let prev_tile_temp = null; //tentative of prev_tile

    for (let n = 0; n < 2; n++) { //resolve at max 2 times. But the 2nd time's angle must be different from the first time's.

        //x coord of the ALREADY-MOVED pc in tilemap cell coords
        let pc_x_min_tilemap = _worldToTilemapCoord(hitbox._xMin);
        let pc_y_min_tilemap = _worldToTilemapCoord(hitbox._yMin);
        let pc_x_max_tilemap = _worldToTilemapCoord(hitbox._width + hitbox._xMin);
        let pc_y_max_tilemap = _worldToTilemapCoord(hitbox._height + hitbox._yMin);
        min_res = Number.MAX_SAFE_INTEGER;

        ///// FINDING RESOLUTION AMOUNT /////////////

        for (tx = pc_x_min_tilemap; tx <= pc_x_max_tilemap; tx++) {
            for (ty = pc_y_min_tilemap; ty <= pc_y_max_tilemap; ty++) {

                //only check border cells, (for efficiency for large pc's) :
                if (tx > pc_x_min_tilemap && tx < pc_x_max_tilemap && ty > pc_y_min_tilemap && ty < pc_y_max_tilemap) {
                    continue;
                }

                //let cell_data = terrain_surface_data[tx + ty * terrain_mapWidth];
                let tile = tx + ty * terrain_mapWidth;
                if (tile === prev_tile) {
                    console.log("yes.");
                    continue; //do not resolve the same tile twice. (since n=2 we good. but for some reason want higher n then a list is necessary ripz)
                }

                let sur_type = terrain_id2sur[terrain_mapArr[tile]]; //get tileID at loc, then get the corersponding surface type of that id

                if (sur_type === undefined) {
                    continue; //id was not mapped to any surface type (most common)
                }

                //cell-wise resolution: we consider each cell's resolution amount. if its smaller we'll replace the old reso amt.

                //premise: check each border cell and record the smallest resolution amount among them, along with the corresponding direction to resolve
                //Then actually resolve with those recorded mag and dir. so the pc has new bounds.
                //then, repeat entire process, the double for loop and stuff (for now). which may result in a second resolution.

                let res = 0; // resolution amount for the current cell

                let vx = 0, vy = 0; //local for diag cases
                switch (sur_type) {
                    //simple cases (4 bit unsigned int): record the resolution
                    //one-hot cases.
                    case 1: //top surface, below pc. push up.
                        res = hitbox._yMin + hitbox._height - ty * TERRAIN_TILESIZE; //this has to be positive. not doing abs.
                        if (res < min_res) {
                            min_res = res;
                            min_res_dir = 270;
                            prev_tile_temp = tile;
                        }
                        continue; //goto next cell since this cell's only 1 edge.\

                    case 2: //right surface, left of pc. push right
                        res = (tx + 1) * TERRAIN_TILESIZE - hitbox._xMin;
                        if (res < min_res) { min_res = res; min_res_dir = 0; prev_tile_temp = tile; }
                        continue;

                    case 4: //down surface, above pc. push down
                        res = (ty + 1) * TERRAIN_TILESIZE - hitbox._yMin;
                        if (res < min_res) { min_res = res; min_res_dir = 90; prev_tile_temp = tile; }
                        continue;

                    case 8: //left surface, right of pc. push left
                        res = hitbox._xMin + hitbox._width - tx * TERRAIN_TILESIZE;
                        if (res < min_res) { min_res = res; min_res_dir = 180; prev_tile_temp = tile; }
                        continue;

                    //////////////Diagonal cases////////////
                    case 16:
                        //16: <-/
                        //top left diag 45 (its normal points to top left.) 
                        //only consider it if botright vertex of rect pc is actually past the surface, within the diamond square area past surface.
                        //can do this by translating origin to the center of the diamond.
                        //Then if the abs(x)+abs(y) <= 1 tile width, it is inside the diamond. x and y are the translated x,y of the botright vertex.
                        vx = hitbox._xMin + hitbox._width - (tx + 1) * TERRAIN_TILESIZE; //translated botright vertex, relative to the origin of diamond center
                        vy = hitbox._yMin + hitbox._height - (ty + 1) * TERRAIN_TILESIZE; //Inverted y?

                        if (Math.abs(vx) + Math.abs(vy) <= TERRAIN_TILESIZE) {
                            res = _point_line_dist(vx, vy, -TERRAIN_TILESIZE, 0, 0, -TERRAIN_TILESIZE); //calling dist with translated coords.
                            if (res < min_res) {
                                min_res = res;
                                min_res_dir = 225;
                                prev_tile_temp = tile;
                            }
                        }
                        continue;
                    case 17:
                        //17: \->
                        //top right diag 45
                        vx = hitbox._xMin - (tx) * TERRAIN_TILESIZE; //translated botleft vertex
                        vy = hitbox._yMin + hitbox._height - (ty + 1) * TERRAIN_TILESIZE;

                        if (Math.abs(vx) + Math.abs(vy) <= TERRAIN_TILESIZE) {
                            res = _point_line_dist(vx, vy, TERRAIN_TILESIZE, 0, 0, -TERRAIN_TILESIZE); //calling dist with translated coords.
                            if (res < min_res) { min_res = res; min_res_dir = 315; prev_tile_temp = tile; }
                        }
                        continue;
                    case 18:
                        //18: /->
                        //bot right diag 45
                        vx = hitbox._xMin - (tx) * TERRAIN_TILESIZE; //translated topleft vertex
                        vy = hitbox._yMin - (ty) * TERRAIN_TILESIZE;

                        if (Math.abs(vx) + Math.abs(vy) <= TERRAIN_TILESIZE) {
                            res = _point_line_dist(vx, vy, 0, TERRAIN_TILESIZE, TERRAIN_TILESIZE, 0); //calling dist with translated coords.
                            if (res < min_res) { min_res = res; min_res_dir = 45; prev_tile_temp = tile; }
                        }

                        continue;
                    case 19:
                        //19: <-\
                        //bot left diag 45

                        vx = hitbox._xMin + hitbox._width - (tx + 1) * TERRAIN_TILESIZE; //translated topright vertex
                        vy = hitbox._yMin - (ty) * TERRAIN_TILESIZE;

                        if (Math.abs(vx) + Math.abs(vy) <= TERRAIN_TILESIZE) {
                            res = _point_line_dist(vx, vy, -TERRAIN_TILESIZE, 0, 0, TERRAIN_TILESIZE); //calling dist with translated coords.
                            if (res < min_res) { min_res = res; min_res_dir = 135; prev_tile_temp = tile; }
                        }
                        continue;

                }

                //not one-hot: (much rarer case than one-hot, ~90% of all walls are one-hot simple. most optimization in the one hot cases)
                //record the minimum res of the 2 or 3 or 4 edges that it was simutaneously incident to.

                if ((sur_type & 1) === 1) {
                    //same as above but is cascading cases instead of exclusive...

                    res = hitbox._yMin + hitbox._height - ty * TERRAIN_TILESIZE;
                    if (res < min_res) { min_res = res; min_res_dir = 270; prev_tile_temp = tile; }

                }
                if ((sur_type & 2) === 2) {
                    res = (tx + 1) * TERRAIN_TILESIZE - hitbox._xMin;
                    if (res < min_res) { min_res = res; min_res_dir = 0; prev_tile_temp = tile; }
                }
                if ((sur_type & 4) === 4) {
                    res = (ty + 1) * TERRAIN_TILESIZE - hitbox._yMin;
                    if (res < min_res) { min_res = res; min_res_dir = 90; prev_tile_temp = tile; }
                }
                if ((sur_type & 8) === 8) {
                    res = hitbox._xMin + hitbox._width - tx * TERRAIN_TILESIZE;
                    if (res < min_res) { min_res = res; min_res_dir = 180; prev_tile_temp = tile; }
                }


                //The minimum resolution amount wins. However this entire process will be repeated up to n times to handle concave cases. End an interation early if it detects no collision.
                //The limit n is needed or it may cause an infinite loop (keeps on resolving), killing the browser.
                //make n just 2 lol
            }
        }
        //END for each pc border cell.

        /////// RESOLUTION //////

        //if min res is not still the MAX INTEGER then it has been found
        //then move pc by that amount.
        //return;
        if (min_res !== Number.MAX_SAFE_INTEGER) {
            //for cleanly doing the axis cases without float inaccuracy
            switch (min_res_dir) {
                case 0:
                    hitbox._xMin += min_res;
                    break;
                case 90:
                    hitbox._yMin += min_res;
                    break;
                case 180:
                    hitbox._xMin -= min_res;
                    break;
                case 270:
                    hitbox._yMin -= min_res;
                    break;

                default:
                    //non axis, trig
                    hitbox._xMin += min_res * Math.cos(Math.PI / 180 * min_res_dir);
                    hitbox._yMin += min_res * Math.sin(Math.PI / 180 * min_res_dir);
                    break;

            }

            prev_tile = prev_tile_temp;
            //first_dir = min_res_dir; //nah fam check the tiles instead.

            //console.log(pc.entityID + " RESOLVED " + n + " frame " + Engine.getFramesElapsed() + " min res "+min_res+" dir "+min_res_dir);

        } else {


            //did not find min res, meaning did not collide with anyhting
            //we wont move the pc at all then and wont check again
            return;

        }



    } //end for n<2

    //END SOLIDITY RESOLUTION


}

/**
 * Add the given hitbox to the entity grid.
 * 
 * only used by updateAll whil looping thru each ent
 * @param {*} hitbox hitbox of the entity that's being added.
 */
function _update_add_ent_to_grid(pc, hitbox) {
    //add the entity (ID) into the grid based on its AABBs. (hitbox's xMin, yMin, width, height)

    let pc_x_min_ent_grid = _worldToEntGridX(hitbox._xMin);
    let pc_y_min_ent_grid = _worldToEntGridY(hitbox._yMin);
    let pc_x_max_ent_grid = _worldToEntGridX(hitbox._width + hitbox._xMin);
    let pc_y_max_ent_grid = _worldToEntGridY(hitbox._height + hitbox._yMin);

    let entBucket;
    let tx = 0, ty = 0;

    //for each cell that PC's bounding box (that is completely within the physics bounds) is in, add it to respective bucket.
    pcAddGrid:
    for (tx = pc_x_min_ent_grid; tx <= pc_x_max_ent_grid; tx++) {
        for (ty = pc_y_min_ent_grid; ty <= pc_y_max_ent_grid; ty++) {
            //do not add negative coords???
            //not sure what to do with negative coords...
            if (tx < 0 || ty < 0) {
                console.log("NEGATIVE COORDS on ent grid. toppleft is off the ent grid");
                continue;
            }

            //currCell = ent_grid[tx][ty]; 
            entBucket = ent_grid[tx + ty * ENT_GRID_WIDTH_T]//cell pos (flattened) relative to the ENT GRID!
            if (!entBucket) {
                console.log("one part of entity " + pc.entityID + " moved outside of physArea while it was inside it before move, not adding part to grid");
                //this is because the parameters pc and hitbox are the ones that are within the physArea bounds BEFORE resolving with terrain (moving).
                //so this is incase the resolution actually pushes some parts of the pc out of the ent grid: just skip this.
                continue;
            }

            // //first, clear the bucket if this cell HASN'T been visited on this frame yet
            // //this is to avoid adding to old data
            // if (!visitedCells.has(currCell)) {
            //     entBucket.reset();
            // }

            //bucket will be cleared AFTER handled.
            //entBucket = ent_grid[currCell];
            entBucket.add(pc.entityID);
            //entBucket.add(parseInt(idStr));
            //visitedCells.add(currCell); //adds duplicates, BAD
        }
    }
}

/**
 * Among hitboxes in the grid, check if they actually collided and call handlers if they did.
 * 
 * Only used by the update method, called every frame.
 */
function _update_narrow_phase() {
    /**
     * @type {Bucket}
     */
    let entBucket;
    let cellCol;
    //for (let i = 0; i < visitedCells.size; i++) {
    //  entBucket = ent_grid[visitedCells.get(i)];

    //FOR EACH ENTITYGRID CELL! (should have no big memory allocs, and smooth for any reasonable number of ents) (but wastes cpu cycles b/c ALWAYS checks ALL cells (ent grid width * height)
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
                            console.log("ALREADY CHECKKKKKKKKKKD XDXDXDXDXD");
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

                            //use new handler -- call the handler function for the two types (both need to have GameData AND a handling function!!!)
                            let dataA = Engine.GameEntity.getData(pcA.entityID);
                            let dataB = Engine.GameEntity.getData(pcB.entityID);
                            if (!dataA || !dataB) {
                                alert("this aint supposed to happen yo")
                                continue;
                            }

                            //The handler function actually needs to exist (and be a function)
                            let func = collision_table[dataA.constructor.name + "|" + dataB.constructor.name];
                            if (typeof func !== "function") {
                                console.log("couldnt find handler function for " + dataA.constructor.name + " and " + dataB.constructor.name);
                                continue;
                            }

                            func(pcA.entityID, pcB.entityID, !collided_pairs.has(hash)); //3rd arg: true if just collided, false otherwise
                            collided_pairs.set(hash, true); //adds if first, sets if already exists.
                            //curr_collided_pairs.add(hash);

                            // if (pcA._onCollide) {
                            //     pcA._onCollide(pcB._getCollisionData ? pcB._getCollisionData() : null);
                            // }
                            // if (pcB._onCollide) {
                            //     pcB._onCollide(pcA._getCollisionData ? pcA._getCollisionData() : null);
                            // }
                            //call onCollide for entities in question.
                            //handle everything b/t the two

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

    //clear checked_pairs since pairs that collided have no (little) relation between frames
    checked_pairs.clear();

    //cleanup the collided pairs: remove the falsy ones, then reset for the cleanup on next frame
    for (let k of collided_pairs.keys()) {
        if (collided_pairs.get(k) === false) {
            collided_pairs.delete(k);
            console.log("removed " + k + "(hash) from collided pairs");
            //Note: this is filtering within the iterating function, works in js but may not in other languages
        }
    }
    for (let k of collided_pairs.keys()) {
        collided_pairs.set(k, false);
    }
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
    //MOVE & BROAD PHASE --------

    //set grid center to whatever the function returns to if it has the func, and snap to cellsize...
    if (typeof ent_grid_getCenter === "function") {
        let wowo = ent_grid_getCenter(); //returns WORLD coordinates
        ent_grid_xMin_t = _worldToEntCoord(wowo.x) - Math.floor(ENT_GRID_WIDTH_T / 2); //this HAS To be an integer
        ent_grid_yMin_t = _worldToEntCoord(wowo.y) - Math.floor(ENT_GRID_HEIGHT_T / 2);
    }


    let ctr = null;
    let hitbox = null;
    let pc = null;

    //visitedCells.clear();

    //first: for each PC, check if it's completely within the grid bounds, then move it, then RESOLVE w/ terrain, then add it to grid based on its bounds after the move & resolve.

    //for (let i = 0; i < physics_comps.length; i++) {
    //physics_comps.forEach((pc, id, map) => {

    // TODO since world is likely going to be pretty big, only update a handful of the closest entities, and recalculate the handful not every frame but every 30 frames for example.

    //FOR EACH PC:
    for (const idStr in physics_comps) {

        //ARBITRARY ORDER - no guarantee it is in order of lower to highest id (? verify?)

        //const pc = physics_comps[i];
        pc = physics_comps[idStr];
        hitbox = pc._hitbox;

        if (!hitbox) {
            //didn't have a hitbox lol...
            continue;
        }

        //only handling rectangular hitboxes for now. if not rect then it doesnt really exist.
        if (!(hitbox instanceof AABBHitbox)) {
            continue;
        }

        //pc hitbox is WITHIN physics update area //TODO
        //IMPORTANT: hitbox must be fully within the bounds... will also check again before adding to entityGrid b/c this first check didn't account for the MOVE

        let pcOldX = hitbox._xMin;
        let pcOldY = hitbox._yMin;
        //check if pc is inside the entity grid:
        if (hitbox._xMin >= ent_grid_xMin_t * ENT_CELLSIZE
            && hitbox._yMin >= ent_grid_yMin_t * ENT_CELLSIZE
            && hitbox._xMin + hitbox._width < (ent_grid_xMin_t + ENT_GRID_WIDTH_T) * ENT_CELLSIZE
            && hitbox._yMin + hitbox._height < (ent_grid_yMin_t + ENT_GRID_HEIGHT_T) * ENT_CELLSIZE) {


            //move the pc, if control is defined
            if (pc._control) {
                ctr = pc._control();

                hitbox._xMin += ctr.dx || 0;
                hitbox._yMin += ctr.dy || 0;
            }

            //resolve the entity with terrain before doing collision with other entitites.
            _update_resolve_terrain(pc, hitbox);

            // pc.postMove();


            //START ADDING TO ENTITY GRID (has different bounds than tilemap if not at 0,0)
            _update_add_ent_to_grid(pc, hitbox);
            //added to grid

            //end if in update area
        } else {
            //console.log(idStr + " NOT IN AREA");
        }


        // //end of physiccomps.forEach for solidity resolution
        //});
        if (typeof pc._postMove === "function") {
            pc._postMove(hitbox._xMin - pcOldX, hitbox._yMin - pcOldY);
        }
        //end iterating physicsComps
    }
    //solidity resolution done, & all entities in update area added to grid
    //Entities will STAY PUT for the rest of the step from here on. ( // TODO solid moving pc's.)

    //~~~~~~~~~~~~~~NARROW PHASE COLLISION, BETWEEN ENTITIES.
    //For each visited cell, only if theres >=2 ents in them, brute force check them then narrow phase collision 
    //for the cell after everything inside it is handled, CLEAR the bucket

    _update_narrow_phase();


}
//END UPDATEALL-------------------------------------------------------------------------------



////////////// math helpers

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
 * given the hashed pair, this returns the two numbers, smaller one is x larger is y.
 */
function _inverse_cantor(z) {
    let w = Math.floor((Math.sqrt(8 * z + 1) - 1) / 2);
    let t = (w * w + w) / 2;
    return {
        y: z - t,
        x: w - y
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

/**
 * 
 * @param {*} x0 point x
 * @param {*} y0 point y
 * @param {*} x1 line x1
 * @param {*} y1 
 * @param {*} x2 line x2
 * @param {*} y2 
 */
function _point_line_dist(x0, y0, x1, y1, x2, y2) {
    return Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1))
        / Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}


// /**
//  * given coordinates in tiles, check the data of that tile.
//  */
// function _checkTerrainData(x, y) {
//     return terrain_idData[terrain_mapArr[x + terrain_mapWidth * y]];
// }

/**
 * converts a world coord to ENTITY GRID CELL COORDS: coordinates relative to the entity grid.
 * Assume the entity grid has its top-left at e_g_x_t and e_g_y_t, is "snapped" to ent_cellsize grid
 */
function _worldToEntGridX(x) {
    return Math.floor((x - ent_grid_xMin_t * ENT_CELLSIZE) / ENT_CELLSIZE);
    //return Math.floor(x / CELLSIZE) + ent_grid_xMin_t;
}
function _worldToEntGridY(y) {
    return Math.floor((y - ent_grid_yMin_t * ENT_CELLSIZE) / ENT_CELLSIZE);
    //return Math.floor(y / CELLSIZE) + ent_grid_yMin_t;
}

/**
 * scales a world coordinate to a coordinate scaled to the entity grid.
 * But note that the returned value may not actually be on the grid, its just on the same scale
 * 
 * ex if size=16, then like 31.9999 will be 1, 16.000 will be 1
 */
function _worldToEntCoord(num) {
    return Math.floor(num / ENT_CELLSIZE);
}

/**
 * scales a world coordinate to a coordinate scaled to the Tile map
 * 
 * ex if size=16, then like 31.9999 will be 1, 16.000 will be 1
 */
function _worldToTilemapCoord(num) {
    return Math.floor(num / TILE_SIZE);
}

/**
 * had to keep a size variable for O(1)
 */
function getCount() {
    return num_PCs;
}

/**
 * Set a array of tile IDs (1-D array representing 2-D, so also specify the width as mapWidth)
 * 
 * ALSO initializes the surface data of the same size
 * 
 * @param mapArr an array of TILE ID's
 * @param {Object.<number, number>} idData an object where: properties are the tile ID's, and the value is a surface type 
 * @param mapWidth width of the mapArr in TILES
 * @param tileSize usually 16
 */
function setTerrainMap(mapArr, id2sur, mapWidth, tileSize = 16) {
    if (!Array.isArray(mapArr) || typeof id2sur !== "object" || typeof mapWidth !== "number" || !Number.isInteger(tileSize)) {
        debugger;
        throw "no.";
    }

    terrain_mapArr = mapArr;
    terrain_id2sur = id2sur;
    terrain_mapWidth = mapWidth;
    TERRAIN_TILESIZE = tileSize;

    // terrain_solid_data = new Array();
    // for (let i = 0; i < mapArr.length; i++) {
    //     terrain_solid_data[i] = null; //initalize all elems to null to start out. big array.
    // }
}

/**
 * This is usually a function that always returns the player's center x and y coordinates
 * @param {Function} func A function that returns, in the format {x: #, y: #},
 * the WORLD x and WORLD y for the CENTER of the grid to snap to, but the grid will only snap to TILE_SIZE intervals.
 */
function setGridCenterRef(func) {
    ent_grid_getCenter = func;
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~HANDLING OF COLLISIONS (CLEAN)
/**
 * assiciates two strings to a function: the key is the two string concatenated.
 * each function will be called in updateAll (when it finds all collisions and handles each one)
 * @type {Object}
 */
let collision_table = {};
/**
 * Associates two types (Strings given by obj.constructor.name) to a collision handling function whose arguments are the entity IDs of 2 entities whose types are in that order (type1, type2).
 * 
 * Note that only one handling function can be associated to a pair of types, so a pair's existing handling function will get overrided by a new handler function.
 * @param {Function} func the function that manipulates data of the two entities, whose data objects are passed in as the two arguments in following order 
 * @param {String} type1 The constructor name of the first argument of func
 * @param {String} type2 second
 */
function newCollisionCase(func, type1, type2) {
    if (typeof type1 !== "string") {
        type1 = "Object";
    }
    if (typeof type2 !== "string") {
        type2 = "Object";
    }
    collision_table[type1 + "|" + type2] = func;
    collision_table[type2 + "|" + type1] = function (a, b) { func(b, a); } //ensures the reversed order of indexing still has the handler called in the correct order
}


// //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~QUERYING
//not doing it F.

// /**list of queries, to be performed in the next updateAll then cleared
//  * @type {Set.<Object.{Hitbox, Type}>}
// */
// let queries = new Set();
// /**
//  * Queue a query to be performed when the next time updateAll is called.
//  * @param {*} type the data used in collision
//  */
// function queryRect(x, y, w, h, type) {
//     queries.add({ hitbox: new AABBHitbox(x, y, w, h), type: type })
// }

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
    let scx = 0, scy = 0, scw = 0, sch = 0; //These are variables that hold a value for rectangle. The same variables are used to hold data for other rectangles later in the code.
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
    ctx.lineWidth = 1;
    //draw Terrain boxes on screen
    //loop thru all tiles that are on screen and check all
    let tx = 0, ty = 0;
    let tileID = 0;
    let sur_type = 0;

    let xi = Math.floor(camera.getExactX() / TERRAIN_TILESIZE), //these 4 are in units of tiles.
        xf = Math.ceil((camera.getExactX() + screenWidth / zoom) / TERRAIN_TILESIZE), //need to divide canvas width by ZOOM.
        yi = Math.floor(camera.getExactY() / TERRAIN_TILESIZE),
        yf = Math.ceil((camera.getExactY() + screenHeight / zoom) / TERRAIN_TILESIZE);
    for (tx = xi; tx < xf; tx++) {
        if (tx < 0) {
            continue;
        }
        for (ty = yi; ty < yf; ty++) {
            if (ty < 0) {
                continue;
            }
            tileID = terrain_mapArr[tx + ty * terrain_mapWidth];
            sur_type = terrain_id2sur[tileID];

            scx = (tx * TERRAIN_TILESIZE - camera.getExactX()) * zoom;
            scy = (ty * TERRAIN_TILESIZE - camera.getExactY()) * zoom;
            //data = terrain_idData[tileID];
            //data = terrain_surface_data[tx + ty * terrain_mapWidth];
            //switch () {
            // case terrain_wall_type.SQUARE:
            //     ctx.beginPath();
            //     ctx.rect(scx, scy, CELLSIZE * zoom, CELLSIZE * zoom);
            //     ctx.stroke();
            //     //ctx.fillRect(scx, scy, CELLSIZE * zoom, CELLSIZE * zoom);
            //     break;
            //case terrain_wall_type.TOP:

            if (sur_type === 16) {
                ctx.beginPath();
                ctx.moveTo(scx, scy + TERRAIN_TILESIZE * zoom);
                ctx.lineTo(scx + TERRAIN_TILESIZE * zoom, scy); //draw line 1 tilesize long
                ctx.stroke();
                continue;
            }
            if (sur_type === 17) {
                ctx.beginPath();
                ctx.moveTo(scx, scy);
                ctx.lineTo(scx + TERRAIN_TILESIZE * zoom, scy + TERRAIN_TILESIZE * zoom);
                ctx.stroke();
                continue;
            }
            if (sur_type === 18) {
                ctx.beginPath();
                ctx.moveTo(scx, scy + TERRAIN_TILESIZE * zoom);
                ctx.lineTo(scx + TERRAIN_TILESIZE * zoom, scy);
                ctx.stroke();
                continue;
            }
            if (sur_type === 19) {
                ctx.beginPath();
                ctx.moveTo(scx, scy);
                ctx.lineTo(scx + TERRAIN_TILESIZE * zoom, scy + TERRAIN_TILESIZE * zoom);
                ctx.stroke();
                continue;
            }



            if (sur_type & 4) {
                //is inefficient as it draws lines individually but some may not be connected so...
                ctx.beginPath();
                ctx.moveTo(scx, scy + TERRAIN_TILESIZE * zoom);
                ctx.lineTo(scx + TERRAIN_TILESIZE * zoom, scy + TERRAIN_TILESIZE * zoom); //draw line 1 tilesize long
                ctx.stroke();
            }
            //break;
            //case terrain_wall_type.RIGHT:
            if (sur_type & 8) {
                ctx.beginPath();
                ctx.moveTo(scx, scy);
                ctx.lineTo(scx, scy + TERRAIN_TILESIZE * zoom);
                ctx.stroke();
            }
            // break;
            //case terrain_wall_type.BOTTOM:
            if (sur_type & 1) {
                ctx.beginPath();
                ctx.moveTo(scx, scy);
                ctx.lineTo(scx + TERRAIN_TILESIZE * zoom, scy);
                ctx.stroke();
            }
            //break;
            //case terrain_wall_type.LEFT:
            if (sur_type & 2) {
                ctx.beginPath();
                ctx.moveTo(scx + TERRAIN_TILESIZE * zoom, scy);
                ctx.lineTo(scx + TERRAIN_TILESIZE * zoom, scy + TERRAIN_TILESIZE * zoom);
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

    scx = (ent_grid_xMin_t * ENT_CELLSIZE - camera.getExactX()) * zoom;
    scy = (ent_grid_yMin_t * ENT_CELLSIZE - camera.getExactY()) * zoom;
    //draw outline of grid...
    ctx.beginPath();
    ctx.rect(scx, scy, ENT_GRID_WIDTH_T * ENT_CELLSIZE * zoom, ENT_GRID_HEIGHT_T * ENT_CELLSIZE * zoom);
    ctx.stroke();


    ctx.restore();
}



export {
    create, remove, get,
    setTerrainMap,
    initEntityGrid, updateAll, setGridCenterRef, drawDebug, getCount,
    isPhysicsComponent,
    newCollisionCase
};