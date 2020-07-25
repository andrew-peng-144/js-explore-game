import * as Engine from "../engine/engine.js";
//Defines a STRING PATH, and associated SLICE DATA.
//purely declaratory, no procedural stuff.
//The declarations are for use with the Engine's HTMLImageSlice.
//Which is exactly the same as this except it's the actual html image object instead of the string path.

let TILE_SIZE = 16;
function wow(imgName, sxt, syt, swt = 1, sht = 1) {
    return {
        name: imgName,
        sx: sxt * TILE_SIZE,
        sy: syt * TILE_SIZE,
        sw: swt * TILE_SIZE,
        sh: sht * TILE_SIZE,
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
    // FIRE: newAnimatedImage(s, 2, 4, 8, 10),
    // WALKING_TEST: newAnimatedImage(s, 2, 4, 0, 13, 1, 2),
    // WALKING_LEFT_TEST: newAnimatedImage(s, 6, 4, 0, 13, 1, 2),
    // WALKING_RIGHT_TEST: newAnimatedImage(s, 2, 4, 2, 13, 1, 2),
    // WALKING_DOWN_TEST: newAnimatedImage(s, 6, 4, 2, 13, 1, 2)
};

/**
 * RETURNS a HTMLImageSection (from Engine) given the imageStringSection.
 * The HTML image element is specified by the second arg of this function
 * @param {idk} imageStringSection iss. defined in this file (have the asdfwow property lmao)
 * @param {Object} assets An object mapping String -> HTMLImageElement. The Strings are the full path to image.
 */
function issToImageSection(imageStringSection, assets) {
    if (imageStringSection.asdfwow !== "WOW") {
        //not even an iss
        throw "RIP";
    }

    if (imageStringSection.n) {
        return Engine.HTMLImageSection.newImageStrip(assets[imageStringSection.name],
            imageStringSection.n,
            imageStringSection.sx,
            imageStringSection.sy,
            imageStringSection.sw,
            imageStringSection.sh

        );
    } else {
        return Engine.HTMLImageSection.newImageSlice(assets[imageStringSection.name],
            imageStringSection.sx,
            imageStringSection.sy,
            imageStringSection.sw,
            imageStringSection.sh

        );
    }

}

export { issToImageSection, imageStringSections }