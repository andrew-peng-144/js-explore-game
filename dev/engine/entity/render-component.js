//Rip have this outsidfe of the engine.?
//TODO add an option to make this based on world or based on screen. that way this can also be used for ui? bruh ui is on another canvas anyway tho. lol.
//Also add a way to set the canvas. some rendercomponents may be on different canvases tha nothers. hav ea way to set a "default"

//TODO TODO COMPONENTS CAN BE STORED AS A "SET" DATA STRUCTURE, IT IS FASTER THAN AN ARRAY FOR ADD/REMOVE/CONTAINS!
//https://stackoverflow.com/questions/39007637/javascript-set-vs-array-performance

import * as Settings from "../settings.js";
//import * as AssetLoader from "../main/assetloader.js";

function RenderComponent(entityRef, ctx, imageSection, camera, offsetX, offsetY) {
    this.entityRef = entityRef;
    this.ctx = ctx;
    if (imageSection.constructor.name !== "ImageSlice" && imageSection.constructor.name !== "ImageStrip"
        || camera.constructor.name !== "Camera2D" || ctx.constructor.name !== "CanvasRenderingContext2D") {
        throw "wrong class buddy";
    }

    this.imageSection = imageSection;
    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;
    this.camera = camera;

    //for animations:
    this.nFrames = 0; //# frames this has been drawn
    this.nSlides = 0; //# slides that have passed in the animation
}

/**
 * draws the image to x and y screen coords.
 */
RenderComponent.prototype.draw = function () {


    //animation code ignore fo rnow
    // let the_sxt = this.image.sxt;
    // if (this.image.delay) {
    //     //animated..

    //     if (this.nFrames % this.image.delay == 0 && this.nFrames / this.image.delay != 0) {
    //         this.nSlides++;
    //     }
    //     the_sxt = this.image.sxt + this.nSlides % this.image.n;

    // }

    // let canvasData = CanvasManager.getCanvasData(this.canvasID);
    //debugger;
    let zoom = Settings.ZOOM;

    // let cam = canvasData.settings.camera;
    // if (!AssetLoader.getAsset(this.imageSection.imgFileName)) {
    //     throw "can't draw asset isn't loaded lmao";
    // }
    let sx = this.imageSection.sx,
        sy = this.imageSection.sy,
        sw = this.imageSection.sw,
        sh = this.imageSection.sh,
        dw = this.imageSection.sw * zoom,
        dh = this.imageSection.sh * zoom;

    if (this.camera) {
        //if canvas has a 2d camera, draw relative to the camera's pos
        let destX = Math.round((this.entityRef.getX() - this.getWidth() / 2 - this.offsetX - this.camera.getExactX()) * zoom);
        let destY = Math.round((this.entityRef.getY() - this.getHeight() / 2 - this.offsetY - this.camera.getExactY()) * zoom);

        this.ctx.drawImage(this.imageSection.image,
            sx, sy, sw, sh,
            destX,
            destY,
            dw, dh
        );

    } else {
        //no camera, just draw absolute position
        this.ctx.drawImage(this.imageSection.image,
            sx, sy, sw, sh,
            Math.round((this.entityRef.getX() - this.getWidth() / 2 - this.offsetX) * zoom),
            Math.round((this.entityRef.getY() - this.getHeight() / 2 - this.offsetY) * zoom),
            dw, dh
        );
    }

    this.nFrames++;
}
/**
 * Gets the width of the image. This is its width in pixels, not accounting for zoom
 */
RenderComponent.prototype.getWidth = function () {
    return this.imageSection.sw;
}
RenderComponent.prototype.getHeight = function () {
    return this.imageSection.sh;
}
RenderComponent.prototype.remove = function () {
    renderComponents.delete(this);
}

var renderComponents = new Set();

/**
 * 
 * @param {Number} offsetX the number of pixels that this image is offset (subtracted) from the center of the gameentity
 */
function createRenderComponent(entityRef, ctx, imageSection, camera, offsetX, offsetY) {
    // if (AssetLoader.getNumAssets === 0) {
    //     throw "can't create render component if there's no assets loaded";
    // }

    let rc = new RenderComponent(entityRef, ctx, imageSection, camera, offsetX, offsetY);
    renderComponents.add(rc);
    return rc;
}

var drawAll = function () {
    renderComponents.forEach(r => r.draw());
}

function getCount() {
    return renderComponents.size;
}
export { createRenderComponent, drawAll, getCount }