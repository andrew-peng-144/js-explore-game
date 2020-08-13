import * as Engine from "../engine/engine.js";
//Defines a STRING PATH, and associated SLICE DATA.
//The declarations are for use with the Engine's HTMLImageSection.
//Which is exactly the same as this except it's the actual html image object instead of the string path.
//So at some point during initialization but after assets are loaded, convert all to HTMLImageSections.

let TILE_SIZE = 16;
function wow(imgName, sxt, syt, swt = 1, sht = 1) {
    return {
        name: imgName,
        sx: sxt * TILE_SIZE,
        sy: syt * TILE_SIZE,
        sw: swt * TILE_SIZE,
        sh: sht * TILE_SIZE,
        n: 1,
        asdfwow: "WOW" //a way to put a "unique identifier" to this "class" LMFAO
    };
}
function awow(imgName, n, sxt, syt, swt = 1, sht = 1) {
    return {
        name: imgName,
        n: n,
        sx: sxt * TILE_SIZE,
        sy: syt * TILE_SIZE,
        sw: swt * TILE_SIZE,
        sh: sht * TILE_SIZE,
        asdfwow: "WOW"
    };
}

let p = "./assets/images/props.png";
let s = "./assets/images/sprites.png";

var imageStringSections = {

    TREE: wow(p, 0, 0, 2, 3),
    SMALLTREE: wow(p, 2, 0, 1, 2),
    BLUE_ORB: wow(p, 0, 8),

    NPC1: wow(s, 1, 0, 1, 2),
    FIRE_BLADE: wow(s, 0, 4),
    UGLY_BLADE: wow(s, 1, 4),
    RAINBALL: wow(s, 2, 4, 4, 20),

    LINKIN: wow(s, 0, 6),
    //BLAZEN: newAnimatedImage(s, 0, 5, 7, 8),
    GOHST: wow(s, 1, 6),
    BOB: awow(s, 10, 4, 0, 10, 1, 2), //new ATImg(s, 6, 9, 0, 10, 1, 2),


    //CLOUD_BKGD: newBackgroundImage("clouds_test_bkgd.png"),
    FIRE: awow(s, 4, 2, 8),
    // WALKING_TEST: newAnimatedImage(s, 2, 4, 0, 13, 1, 2),
    // WALKING_LEFT_TEST: newAnimatedImage(s, 6, 4, 0, 13, 1, 2),
    // WALKING_RIGHT_TEST: newAnimatedImage(s, 2, 4, 2, 13, 1, 2),
    NPC1_WALKING_SOUTH: awow(s, 4, 2, 0, 1, 2),
    NPC1_WALKING_NORTH: awow(s, 4, 6, 2, 1, 2),
    NPC1_WALKING_EAST: awow(s, 4, 2, 2, 1, 2),
    NPC1_WALKING_WEST: awow(s, 4, 6, 0, 1, 2)
};

/**
 * RETURNS a HTMLImageSection (from Engine) given the imageStringSection.
 * The HTML image element is specified by the second arg of this function
 * @param {idk} imageStringSection iss. defined in this file (have the asdfwow property lmao)
 * 
 */
function issToImageSection(imageStringSection, assets) {
    if (imageStringSection.asdfwow !== "WOW") {
        //not even an iss
        throw "RIP";
    }
    return Engine.HTMLImageSection.create(assets[imageStringSection.name],
        imageStringSection.sx,
        imageStringSection.sy,
        imageStringSection.sw,
        imageStringSection.sh,
        imageStringSection.n,
    );

    // if (imageStringSection.n) {
    //     return Engine.HTMLImageSection.newImageStrip(assets[imageStringSection.name],
    //         imageStringSection.n,
    //         imageStringSection.sx,
    //         imageStringSection.sy,
    //         imageStringSection.sw,
    //         imageStringSection.sh

    //     );
    // } else {
    //     return Engine.HTMLImageSection.newImageSlice(assets[imageStringSection.name],
    //         imageStringSection.sx,
    //         imageStringSection.sy,
    //         imageStringSection.sw,
    //         imageStringSection.sh

    //     );
    // }

}

var converted = false;
//var assetsRef = null;

/**
 * Converts the namespace of iss's values to HTMLImageSections.
 * Enables usage of section() to get the namespace from anywhere
 * @param {Object} assets REQUIRED: An object mapping String -> HTMLImageElement. The Strings are the full path to image.
 */
function convert(assets) {
    Object.keys(imageStringSections).forEach(property => {
        imageStringSections[property] = issToImageSection(imageStringSections[property], assets);
    });

    Object.freeze(imageStringSections);

    converted = true;
    //assetsRef = assets;
}

/**
 * Gets the iss namespace which now holds HTMLImageSections. Only works after convert() is called.
 */
function sections() {
    if (!converted) {
        throw "bruh";
    }

    return imageStringSections;
}

export { convert, sections }