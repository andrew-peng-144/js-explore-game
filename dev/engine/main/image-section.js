/*
sometimes you use images packed into one.
this is to define sections of the large packed image, as x,y,w,h bounds
*/

/**
 * defines the bounds (x,y,w,h) for a slice of the given image (file)
 * @param {String} imgFileName 
 * @param {Number} sx x coordinate, in pixels, of where to start the slice on the image of imgFileStr.
 * @param {Number} sy 
 * @param {Number} sw 
 * @param {Number} sh 
 */
function ImageSlice(imgFileName, sx, sy, sw, sh) {
    if (typeof imgFileName !== "string" || sx !== 0 && !sx || sy !== 0 && !sy || !sw || !sh) {
        throw "All bounds must be defined!";
    }
    this.imgFileName = imgFileName;
    this.sx = sx;
    this.sy = sy;
    this.sw = sw;
    this.sh = sh;
}
/**
 * Same as ImageSlice but defines multiple images (of the same width and height) in a hortizontal row.
 * Used for defining an animation clip
 * @param {Number} n number of images to define in that row
 * @param {Number} sw width of ONE IMAGE in pixels
 */
function ImageStrip(imgFileName, n, sx, sy, sw, sh) {
    ImageSlice.call(this, imgFileName, sx, sy, sw, sh);
    // this.imgFileName = imgFileName;
    // this.sx = sx;
    // this.sy = sy;
    // this.sw = sw;
    // this.sh = sh;
    this.n = n;
}

/**
 * returns the data in the params as an object, representing a section of the image.
 */
function newImageSlice(imgFileName, sx, sy, sw, sh) {
    return new ImageSlice(imgFileName, sx, sy, sw, sh);
}
function newImageStrip(imgFileName, n, sx, sy, sw, sh) {
    return new ImageStrip(imgFileName, n, sx, sy, sw, sh);
}

export { newImageSlice, newImageStrip }