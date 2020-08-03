//Rip have this outsidfe of the engine.?

//COMPONENTS CAN BE STORED AS A "SET" DATA STRUCTURE, IT IS FASTER THAN AN ARRAY FOR ADD/REMOVE/CONTAINS!
//https://stackoverflow.com/questions/39007637/javascript-set-vs-array-performance

import * as Settings from "../settings.js";
import * as HTMLImageSection from "../main/htmlimage-section.js";
import { TILE_SIZE } from "../../modules/mysettings.js";
//import * as AssetLoader from "../main/assetloader.js";

// function RenderComponent(entityRef, ctx, imageSection, camera, offsetX, offsetY) {
//     this.entityRef = entityRef;
//     this.ctx = ctx;
//     if (imageSection.constructor.name !== "ImageSlice" && imageSection.constructor.name !== "ImageStrip"
//         || camera.constructor.name !== "Camera2D" || ctx.constructor.name !== "CanvasRenderingContext2D") {
//         throw "wrong class buddy";
//     }

//     //TODO allow to store references to multiple imagesections - multiple animations/images.
//     this.imageSection = imageSection;
//     this.offsetX = offsetX || 0;
//     this.offsetY = offsetY || 0;
//     this.camera = camera;

//     //for animations:
//     this.nFrames = 0; //# frames this has been drawn
//     this.nSlides = 0; //# slides that have passed in the animation
// }

// function newDef() {
//     return new RenderComponentDef();
// }

function RenderComponent() {
    this.ctx = null;
    this.graphics = new Map();
    this.offsetX = 0;
    this.offsetY = 0;
    this.camera = null;

    this.currGraphicKey = 0;

    //for handling the current animation
    this.anim_frameCount = 0;
    this.anim_slideCount = 0;
}
RenderComponent.prototype.setContext2D = function (ctx) {
    this.ctx = ctx;
    return this;
}
/**
 * Add a ImageSlice that can be displayed on this entity.
 * The "key" of the image can be specified for identifying which image to set this r.c. to with setCurrImage or will assume key = 0 (which will override other 0's)
 */
RenderComponent.prototype.addImageSlice = function (is, key) {
    if (
        !HTMLImageSection.isImageSlice(is)
    ) { throw "rip"; }

    if (!key) {
        key = 0;
    }
    this.graphics.set(key, is);
    return this;
}
/**
 * Add a ImageStrip as an ANIMATION to this entity!
 * @param {Number} key Continuous with addImageSlice's key param, assume 0
 * @param {Number} delay The delay between animation slides, in number of frames, default 15.
 */
RenderComponent.prototype.addAnimation = function (istrip, key, delay = 15) {
    if (!HTMLImageSection.isImageStrip(istrip)) {
        throw "(st)rip";
    }
    if (!key) {
        key = 0;
    }
    //let animObj = {};

    //add properties to istrip (value of graphics Map)
    istrip.isAnim = true;
    istrip.delay = delay;

    this.graphics.set(key, istrip);
    return this;
}

RenderComponent.prototype.setOffset = function (x, y) {
    if (typeof x !== "number" && typeof y !== "number") {
        throw "rip";
    }
    this.offsetX = x;
    this.offsetY = y;
    return this;
}
RenderComponent.prototype.setCamera = function (cam) {
    if (cam.constructor.name !== "Camera2D") {
        throw "rip";
    }
    this.camera = cam;
    return this;
}

/**
 * Set which graphic to render given the key.
 * If it is set to an animation, the animation will start immediately.
 */
RenderComponent.prototype.setCurrGraphic = function (key) {
    this.currGraphicKey = key;

    this.anim_frameCount = 0;
    this.anim_slideCount = 0;

    return this;
}

RenderComponent.prototype.setEntityRef = function (entityRef) {
    this.entityRef = entityRef;
     return this;
}



/**
 * draws the image to x and y screen coords.
 */
RenderComponent.prototype.draw = function () {

    debugger;


    // let canvasData = CanvasManager.getCanvasData(this.canvasID);
    //debugger;
    let zoom = Settings.ZOOM;

    // let cam = canvasData.settings.camera;
    // if (!AssetLoader.getAsset(this.imageSection.imgFileName)) {
    //     throw "can't draw asset isn't loaded lmao";
    // }

    let graphic = this.graphics.get(this.currGraphicKey);
    let sx = graphic.sx,
        sy = graphic.sy,
        sw = graphic.sw,
        sh = graphic.sh,
        dw = graphic.sw * zoom,
        dh = graphic.sh * zoom;


    //TODO draw animashunz.
    //animation code 
    if (graphic.isAnim) {
        //is animation so tick counters and set sx

        if (this.anim_frameCount % graphic.delay === 0 && this.anim_frameCount !== 0) {
            this.anim_slideCount++;
        }

        // let the_sxt = this.image.sxt;
        // if (this.image.delay) {
        //     //animated..

        //     if (this.nFrames % this.image.delay == 0 && this.nFrames / this.image.delay != 0) {
        //         this.nSlides++;
        //     }
        sx = graphic.sx + (this.anim_slideCount % graphic.n) * graphic.sw;
        //Choosing which keyframe to draw based on time passed & width of graphic

        // }
        this.anim_frameCount++;
    }


    let camOffsetX = 0, camOffsetY = 0;
    if (this.camera) {
        //if canvas has a 2d camera, draw relative to the camera's pos
        camOffsetX = this.camera.getExactX();
        camOffsetY = this.camera.getExactY();
    }
    let destX = Math.round((this.entityRef.getX() - this.getWidth() / 2 - this.offsetX - camOffsetX) * zoom);
    let destY = Math.round((this.entityRef.getY() - this.getHeight() / 2 - this.offsetY - camOffsetY) * zoom);

    this.ctx.drawImage(graphic.image,
        sx, sy, sw, sh,
        destX,
        destY,
        dw, dh
    );


    this.nFrames++;
}
/**
 * Gets the width of the image, specifying the key, or will assume key 0. This is its width in pixels, not accounting for zoom
 */
RenderComponent.prototype.getWidth = function (key = 0) {
    return this.graphics.get(key).sw;
}
RenderComponent.prototype.getHeight = function (key = 0) {
    return this.graphics.get(key).sh;
}
RenderComponent.prototype.remove = function () {
    renderComponents.delete(this);
}

// var tileSize = 16;
// //STATIC///
// /**
//  * Sets the edge length of a tile in pixels used for 
//  */
// RenderComponent.setTileSize = function(ts = 16) {
//     tileSize = ts;
// }

var renderComponents = new Set();

/**
 * create a rendercomponent with default values. Set the ctx, images, camera, using the instance methods.
 * Ctx and at least 1 imagesection must be present in order for it to be drawn!
 *
 * @param {Number} offsetX the number of pixels that this image is offset (subtracted) from the center of the gameentity
 */
function createRenderComponent() {
    // if (AssetLoader.getNumAssets === 0) {
    //     throw "can't create render component if there's no assets loaded";
    // }

    let rc = new RenderComponent();
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