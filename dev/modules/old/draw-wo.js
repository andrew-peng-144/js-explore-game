//UNUSED.

// import { IMAGE, MyImage } from "./image.js";
// import { TILE_SIZE } from "./globals.js";
import { Camera } from "./camera.js";
const ZOOM = 2;
/**
 * @param {HTMLImageElement[]} assets
 * @param {CanvasRenderingContext2D} context 
 * @param {MyImage} image
 * @param {Number} wx world position of the image.
 * @param {Number} wy 
 */
function drawImageToWorld(assets, context, image, wx, wy) {
    // var camera = {
    //     getExactX: function() {return 0;},
    //     getExactY: function() {return 0;}
    // }
    context.drawImage(assets[image.fileStr], image.sxt * TILE_SIZE, image.syt * TILE_SIZE, image.swt * TILE_SIZE, image.sht * TILE_SIZE,
        Math.round(wx - Camera.getExactX()), Math.round(wy - Camera.getExactY()), image.swt * TILE_SIZE * ZOOM, image.sht * TILE_SIZE * ZOOM);
}
/**
 * @param {HTMLImageElement[]} assets
 * @param {CanvasRenderingContext2D} context 
 * @param {MyImage} image
 * @param {Number} x
 * @param {Number} y 
 * @param {Number} width
 * @param {Number} height
 */
function drawImageToScreen(assets, context, image, x, y, width, height) {
    context.drawImage(assets[image.fileStr],x,y,width,height);
}

export { drawImageToScreen
 };