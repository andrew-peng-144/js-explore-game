import * as Engine from "../engine/engine.js";
//EMBRACE THE GRID!

//The tilemap is made of many different tiles, each with their own ID. Which is an integer (either starting from 0 or 1)

//Each tile ID is not just an image, but also associates with some data. Ex: solidity, terrain type.

//ASSUME:
//solid = false
//terrain = idk?

//Tiles can either be a SURFACE or be a filled SQUARE. Both are "solid" meaning entities will collide and resolve with them.
//For surfaces, Yes.
//For squares, a "wall" will be detected around the AABB and it will try to move away from the "wall", avoiding the entity getting stuck on square boundaries.

// function Line(x1, y1, x2, y2) {
//     return {x1: x1, y1: y1, x2: x2, y2: y2}
// }
let type = Engine.PhysicsComponent.terrain_wall_type;

//IMPORTANT: these IDs are 0-indexed on the tilemap, but Tiled exports (json) to be 1-indexed, so the exported data is actually all of these +1.
let id_Data0 = {
    // 2: type.BOTTOM,
    // // 51: type.SQUARE,
    // // 71: type.SQUARE,
    // 208: type.BOTTOM,

    // 86: type.TOP,
    // 103: type.RIGHT,
    // 118: type.BOTTOM,
    // 101: type.LEFT,

    // //209: type.RIGHT,
    // //193: type.BOTTOM_RIGHT,
    // 210: type.RIGHT,
    // 226: type.RIGHT,


    //Grass-water
    11: type.DOWN,
    26: type.RIGHT,
    28: type.LEFT,
    43: type.UP,
    13: type.LEFT | type.UP,
    14: type.RIGHT | type.UP,
    29: type.LEFT | type.DOWN,
    30: type.RIGHT | type.DOWN,
    idk: ""

}

//NAMES of Tiled objects.
// let object_data = {
//     player
// }

// function isSolid(id) {
//     return wow[id].solid || false;
// }
// function isTerrain(idk) {
//     throw "WOW";
// }
let id_data = {};
for (const id in id_Data0) {
    id_data[parseInt(id) + 1] = id_Data0[id];
}

export {id_data};