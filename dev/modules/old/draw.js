/**
 * ~drawimagetoworld
 * ~drawtoworld
* Draws the still image onto the world at the given coordinates. Can draw any image, does not have to be attached to a gameobject. So tiles for example
* @param wx x coordinate on world, in pixels. 
*/
var drawStillImageToWorld = function (image, wx, wy) {
    this.drawAnimatedImageToWorld(image, undefined, wx, wy);
}
/**
 * Draws image at the given frame onto world at given coords.
 * An alternative to doing gameobject.draw
 */
var drawAnimatedImageToWorld = function (image, currentFrame, wx, wy) {
    C.bufferCC.drawImage(assets[image.fileStr], (currentFrame || image.sxt) * TILE_SIZE, image.syt * TILE_SIZE, image.swt * TILE_SIZE, image.sht * TILE_SIZE,
        Math.round(wx - camera.getExactX()), Math.round(wy - camera.getExactY()), image.swt * TILE_SIZE, image.sht * TILE_SIZE);
}