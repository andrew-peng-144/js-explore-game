import * as Engine from "../engine/engine.js";
//EMBRACE THE GRID!

//Each tilemap has a reference to a TileSET. This Tileset lays out the possible tiles that may be drawn on the tilemap.

//When loading a new area:
/*
need the tilemap JSON file name
The JSON file should have these associated with it:
tileset image file name (or could have entire game use the same tileset...)
gid to object (or could have entire game use the same object tileset...)

*/

// /**
//  * Associates a tiledmap JSON file to its tileset and object map
//  */
// let wow = {
//     "wowo.json": {set: "tileset.png", gti: gti.ow},
// }

//maps the gIDs to image filenames ("object map")
let gti = {
    257: "smalltree.png",
    258: "tree.png"

}

// //maps the tileset to the solidity data of each ID
// let tsd = {
//     "tileset.png":id_Data0
// }

//The tilemap data has a long list of tile IDs.

//Each tile ID is not just an image, but also associates with some data. Ex: solidity, terrain type.

// function Line(x1, y1, x2, y2) {
//     return {x1: x1, y1: y1, x2: x2, y2: y2}
// }
//let type = Engine.PhysicsComponent.terrain_wall_type;


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
    11: 4, //type.DOWN,
    26: 2, //type.RIGHT,
    28: 8, //type.LEFT,
    43: 1, //type.UP,
    13: 16, //type.LEFT | type.UP,
    14: 17, //type.RIGHT | type.UP,
    29: 19, //type.LEFT | type.DOWN,
    30: 18//6, //type.RIGHT | type.DOWN,

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

export { id_data, gti };