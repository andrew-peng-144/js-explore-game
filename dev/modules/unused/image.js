//old but reuse sum


import { V_WIDTH, V_HEIGHT, TILE_SIZE, ZOOM } from "./globals.js";
import * as AssetLoader from "./assetloader.js";
// function TImg(fileStr, sxt, syt, swt, sht) {
//   this.fileStr = fileStr;
//   this.sxt = sxt;
//   this.syt = syt;
//   this.swt = swt || 1;
//   this.sht = sht || 1;

// }
// function ATImg(fileStr, sxti, sxtf, syt, delay, swt, sht) {
//   TImg.call(this, fileStr, sxti, syt, swt, sht);
//   this.animated = true;
//   this.sxti = sxti;
//   this.sxtf = sxtf;
//   this.delay = delay || 60;
// }
/**
 * Contains data for image file, image position and bounds.
 * If its animateed, n is > 1, and delay is specified.
 * For most images in the game, not including tiles.
 * @param n number of slides in the animation
 * @param delay number of frames between each animation slide
 * @param sxti x coordinate of source, initial x coord if animated
 */
function MyImage(fileStr, sxti, n, syt, delay, swt, sht) {
    this.fileStr = fileStr;

    this.n = n;
    this.delay = delay || undefined;
    // this.frames = 0;
    // this.currSlide = 0;

    this.sxt = sxti;
    this.syt = syt;
    this.swt = swt || 1;
    this.sht = sht || 1;
}
MyImage.prototype.getWidth = function () { return this.swt * TILE_SIZE }
MyImage.prototype.getHeight = function () { return this.sht * TILE_SIZE }
MyImage.prototype.isAnimated = function () { return this.n > 1; }



/** all required but swt and sht */
function newStillImage(fileStr, sxt, syt, swt, sht) {
    return new MyImage(fileStr, sxt, 1, syt, undefined, swt, sht);
}
/** all required but delay, swt, and sht
 * @param n number of animation frames*/
function newAnimatedImage(fileStr, sxti, n, syt, delay, swt, sht) {
    return new MyImage(fileStr, sxti, n, syt, delay || 15, swt, sht);
}


function newBackgroundImage(fileStr) {
    return new MyImage(fileStr, 0, 1, 0, undefined, V_WIDTH, V_HEIGHT);
}




var s = "sprites.png",
    //t = "tileset.png",
    p = "props.png";
    /** Definitions for images. Defines location, bounds, animation properties. */
var imagesidk = {
    Image: MyImage,
    newStillImage: newStillImage,
    newAnimatedImage: newAnimatedImage,

    // GRASS: newStillImage(t, 0, 0), //new TImg(t, 0, 0),
    // STONE: newStillImage(t, 1, 0), //new TImg(t, 1, 0),
    // SAND: newStillImage(t, 0, 1), //new TImg(t, 0, 1),
    // WATER: newStillImage(t, 1, 1), //new TImg(t, 1, 1),

    // COBBLE: newStillImage(t, 6, 6),
    // BRICK1: newStillImage(t, 2, 3),
    // BRICK2: newStillImage(t, 3, 3),

    TREE: newStillImage(p, 0, 0, 2, 3),
    SMALLTREE: newStillImage(p, 2, 0, 1, 2),
    BLUE_ORB: newStillImage(p, 0, 8),

    NPC1: newStillImage(s, 1, 0, 1, 2),
    FIRE_BLADE: newStillImage(s, 0, 4),
    UGLY_BLADE: newStillImage(s, 1, 4),
    RAINBALL: newStillImage(s, 2, 4, 4, 20),

    LINKIN: newStillImage(s, 0, 6),
    BLAZEN: newAnimatedImage(s, 0, 5, 7, 8),
    GOHST: newStillImage(s, 1, 6),
    BOB: newAnimatedImage(s, 10, 4, 0, 10, 1, 2), //new ATImg(s, 6, 9, 0, 10, 1, 2),


    CLOUD_BKGD: newBackgroundImage("clouds_test_bkgd.png"),
    FIRE: newAnimatedImage(s, 2, 4, 8, 10),
    WALKING_TEST: newAnimatedImage(s, 2, 4, 0, 13, 1, 2),
    WALKING_LEFT_TEST: newAnimatedImage(s, 6, 4, 0, 13, 1, 2),
    WALKING_RIGHT_TEST: newAnimatedImage(s, 2, 4, 2, 13, 1, 2),
    WALKING_DOWN_TEST: newAnimatedImage(s, 6, 4, 2, 13, 1, 2)
};

export { imagesidk as IMAGE, MyImage };