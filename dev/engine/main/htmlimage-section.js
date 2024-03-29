/*
sometimes you use images packed into one.
this is to define sections of the large packed HTML image, as x,y,w,h bounds. So it's a htmlimstageelement with associated bounds.
Must be an HTMLImageElement! The user needs to pass in a reference to the HTML image.
*/


function ImageSection(image, sx, sy, sw, sh, n) {
    if (image.constructor.name !== HTMLImageElement.name
        || typeof sx !== "number"
        || typeof sy !== "number"
        || typeof sw !== "number"
        || typeof sh !== "number"
        || typeof n !== "number"
    ) {
        throw "All bounds must be defined!";
    }
    this.image = image;
    this.sx = sx;
    this.sy = sy;
    this.sw = sw;
    this.sh = sh;
    this.n = n;
}
/**
 * defines the bounds (x,y,w,h) for a section of the given image (file)
 * and also how many sw's-number-of-pixels it extends horizontally (n)
 * @param {HTMLImageElement} image
 * @param {Number} sx x coordinate, in pixels, of where to start the slice on the image of imgFileStr.
 * @param {Number} sy 
 * @param {Number} sw 
 * @param {Number} sh 
 * @param {Number} n number of images to define in that row, width of each is sw. (2 or higher means it has multiple "slides", but 1 or less all mean just a single slide)
 */
function create(image, sx, sy, sw, sh, n) {
    return new ImageSection(image, sx, sy, sw, sh, n);
}
// /**
//  * Same as ImageSlice but defines multiple images (of the same width and height) in a hortizontal row.
//  * Used for defining an animation clip
//  * @param {Number} n number of images to define in that row
//  * @param {Number} sw width of EACH INDIVIDUAL IMAGE in pixels
//  */
// function ImageStrip(image, n, sx, sy, sw, sh) {
//     ImageSlice.call(this, image, sx, sy, sw, sh);
//     // this.imgFileName = imgFileName;
//     // this.sx = sx;
//     // this.sy = sy;
//     // this.sw = sw;
//     // this.sh = sh;
//     this.n = n;
// }

// /**
//  * returns the data in the params as an object, representing a section of the image.
//  */
// function newImageSlice(image, sx, sy, sw, sh) {
//     return new ImageSlice(image, sx, sy, sw, sh);
// }
// function newImageStrip(image, n, sx, sy, sw, sh) {
//     return new ImageStrip(image, n, sx, sy, sw, sh);
// }

// //TODO needa actually use this method outside
// function isImageStrip(obj) {
//     return obj instanceof ImageStrip;
// }

// function isImageSlice(obj) {
//     return obj instanceof ImageSlice;
// }

function isImageSection(obj) {
    return obj instanceof ImageSection;
}

export { create, isImageSection }