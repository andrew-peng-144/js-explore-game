import * as Engine from "../engine/engine.js";

let TILE_SIZE = 16;
function newStillImage(imgName, sxt, syt, swt = 1, sht = 1) {
    return Engine.ImageSection.newImageSlice("./assets/images/" + imgName,
        sxt * TILE_SIZE, syt * TILE_SIZE, swt * TILE_SIZE, sht * TILE_SIZE);
}
function newAnimatedImage(imgName, n, sxt, syt, swt = 1, sht = 1) {
    return Engine.ImageSection.newImageStrip("./assets/images/" + imgName,
        n, sxt * TILE_SIZE, syt * TILE_SIZE, swt * TILE_SIZE, sht * TILE_SIZE);
}

let p = "props.png";
let s = "sprites.png";

var imageSections = {

    TREE: newStillImage(p, 0, 0, 2, 3),
    SMALLTREE: newStillImage(p, 2, 0, 1, 2),
    BLUE_ORB: newStillImage(p, 0, 8),

    NPC1: newStillImage(s, 1, 0, 1, 2),
    FIRE_BLADE: newStillImage(s, 0, 4),
    UGLY_BLADE: newStillImage(s, 1, 4),
    RAINBALL: newStillImage(s, 2, 4, 4, 20),

    LINKIN: newStillImage(s, 0, 6),
    //BLAZEN: newAnimatedImage(s, 0, 5, 7, 8),
    GOHST: newStillImage(s, 1, 6),
    BOB: newAnimatedImage(s, 10, 4, 0, 10, 1, 2), //new ATImg(s, 6, 9, 0, 10, 1, 2),


    //CLOUD_BKGD: newBackgroundImage("clouds_test_bkgd.png"),
    // FIRE: newAnimatedImage(s, 2, 4, 8, 10),
    // WALKING_TEST: newAnimatedImage(s, 2, 4, 0, 13, 1, 2),
    // WALKING_LEFT_TEST: newAnimatedImage(s, 6, 4, 0, 13, 1, 2),
    // WALKING_RIGHT_TEST: newAnimatedImage(s, 2, 4, 2, 13, 1, 2),
    // WALKING_DOWN_TEST: newAnimatedImage(s, 6, 4, 2, 13, 1, 2)
};

export { imageSections }