
import { TILE_SIZE, ZOOM } from "./globals.js";
import * as AssetLoader  from "./assetloader.js";
import {Camera} from "./camera.js";

/**
 * A sprite is an image definition, and an x and y offset
 * @param {} myImage 
 * @param {*} offX 
 * @param {*} offY 
 */
function Sprite(myImage, offX, offY) {
    this.image = myImage;
    this.offX = offX;
    this.offY = offY;

    this.nFrames = 0;
    this.nSlides = 0;
}

Sprite.prototype.draw = function (ctx) {
    let the_sxt = this.image.sxt;
    if (this.image.delay) {
        //animated..
        //debugger;
        if (this.nFrames % this.image.delay == 0 && this.nFrames / this.image.delay != 0) {
            this.nSlides++;
        }
        the_sxt = this.image.sxt + this.nSlides % this.image.n;

    }
    ctx.drawImage(AssetLoader.assets[this.image.fileStr],
        the_sxt * TILE_SIZE,
        this.image.syt * TILE_SIZE,
        this.image.swt * TILE_SIZE,
        this.image.sht * TILE_SIZE,
        Math.round((this.offX - Camera.getExactX()) * ZOOM),
        Math.round((this.offY - Camera.getExactY()) * ZOOM),
        this.image.swt * TILE_SIZE * ZOOM,
        this.image.sht * TILE_SIZE * ZOOM
    );

    this.nFrames++;
}

export { Sprite };