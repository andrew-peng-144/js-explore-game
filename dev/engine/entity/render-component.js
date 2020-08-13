//This may undergo major revision........














//TODO only draw on the ones on screen, AND have a sorted-order for them.

















//Rip have this outsidfe of the engine.?

//COMPONENTS CAN BE STORED AS A "SET" DATA STRUCTURE, IT IS FASTER THAN AN ARRAY FOR ADD/REMOVE/CONTAINS!
//https://stackoverflow.com/questions/39007637/javascript-set-vs-array-performance

import * as Settings from "../settings.js";
import * as HTMLImageSection from "../main/htmlimage-section.js";

import { Camera2D } from "../main/camera2D.js";
import { PhysicsComponent } from "../engine.js";

var defaultCtx = null;
var defaultCam = null;

/**
 * @type {Map<number, RenderComponent>}
 */
var renderComponents = new Map();

function RenderComponent(id) {
    if (typeof id !== "number") {
        throw "YES";
    }
    if (renderComponents.has(id)) {
        throw id + " already has a rendercomponent.";
    }
    this.entityID = id;

    this.ctx = defaultCtx;
    //this.imageSection = null;
    this.x = 0;
    this.y = 0;

    this.pcRef = null;
    this.pcOffX = 0;
    this.pcOffY = 0;
    // this.getX = null;
    // this.getY = null;
    this.camera = defaultCam;

    //for imageStrips.
    this.currSlide = 0;

    //user-set function that return Image and Slide for drawing
    this.getSection = null;
    this.getSlide = null;

    // renderComponents.add(rc);
    renderComponents.set(id, this);
}


//Initializer methods///////////////

RenderComponent.prototype.setContext2D = function (ctx) {
    this.ctx = ctx;
    return this;
}

/**
 * Sets the function that returns the imageSection
 * @param {Function} func
 */
RenderComponent.prototype.setGetSection = function (func) {
    if (typeof func === "function") {
        if (func()) {
            if (HTMLImageSection.isImageSection(func())) {
                this.getSection = func;
                return this;
            }
        }
    }
    throw "Callback needs to return a ImageSection";
}

/**
 * Sets the function that returns the slide (if the current image is a ImageSlice, it is unaffected).
 * @param {Function} func
 */
RenderComponent.prototype.setGetSlide = function (func) {
    if (typeof func === "function") {
        if (func()) {
            if (typeof func() === "number") {
                this.getSlide = func;
                return this;
            }
        }
    }
    throw "Callback needs to return a number";
}
// /**
//  * Set two functions, both returning a number for the x and y coordinates to set this rendercomponent to every frame right before drawing.
//  * If this function is never called, the RC will just be drawn at 0,0 (world coords)
//  * @param {Function} getX function that returns an x value. Typically bind()ed with the object with the x value...
//  * @param {Function} getY also use bind()
//  */
// RenderComponent.prototype.linkToPosition = function (getX, getY) {
//     debugger;
//     if (typeof getX === "function" && typeof getY === "function") {
//         if (typeof getX() === "number" && typeof getY() === "number") {
//             this.getX = getX;
//             this.getY = getY;
//             return this;
//         }
//     }
//     throw "Callbacks need to both return a number";
// }
/**
 * pass in a PhysicsComponent whose AABB's position is where this RC should be drawn...
 * it will center the image on the hitbox.
 * setPosition() will not do anything after setting this
 * @param {Number} offX Offset in the x direction, positive will move the image RIGHT relative to the pc.
 * @param {Number} offY offset in the y dir, position will move image DOWN
 */
RenderComponent.prototype.linkPosToPhysics = function (pc, offX, offY) {
    if (PhysicsComponent.isPhysicsComponent(pc)) {
        this.pcRef = pc;
        this.pcOffX = offX;
        this.pcOffY = offY;
        return this;
    }
    throw "bruh";
}
/**
 * Sets the position relative to the screen, or world if there is a camera
 */
RenderComponent.prototype.setPosition = function (x, y) {
    if (typeof x !== "number" && typeof y !== "number") {
        throw "rip";
    }
    this.x = x;
    this.y = y;
    return this;
}
RenderComponent.prototype.setCamera = function (cam) {
    if (cam.constructor.name !== "Camera2D") {
        throw "rip";
    }
    if (cam === this.camera) {
        console.log("This exact camera was already set");
    }
    this.camera = cam;
    return this;
}

// RenderComponent.prototype.setEntityRef = function (entityRef) {
//     this.entityRef = entityRef;
//     return this;
// }

// /**
//  * draws the image to screen coords given world coords. Called by drawAll.
//  */
// RenderComponent.prototype.draw = function (x, y) {

//     //debugger;
//     // if (this.positionObj) {
//     //     this.x = obj.x;
//     //     this.y = obj.y;
//     // }

//     // let canvasData = CanvasManager.getCanvasData(this.canvasID);
//     //debugger;
//     let zoom = Settings.ZOOM;

//     // let cam = canvasData.settings.camera;
//     // if (!AssetLoader.getAsset(this.imageSection.imgFileName)) {
//     //     throw "can't draw asset isn't loaded lmao";
//     // }

//     //let imgSection = this.imageSection;
//     let imgSection = this.getSection();

//     let sx = imgSection.sx,
//         sy = imgSection.sy,
//         sw = imgSection.sw,
//         sh = imgSection.sh,
//         dw = imgSection.sw * zoom,
//         dh = imgSection.sh * zoom;

//     // for images with n=2 or higher, choose which slide
//     if (imgSection.n >= 2) {
//         sx = imgSection.sx + (this.getSlide() % imgSection.n) * imgSection.sw;
//     }

//     let camOffsetX = 0, camOffsetY = 0;
//     if (this.camera) {
//         //if canvas has a 2d camera, draw relative to the camera's pos
//         camOffsetX = this.camera.getExactX();
//         camOffsetY = this.camera.getExactY();
//     }
//     let destX = Math.round((x - camOffsetX) * zoom);
//     let destY = Math.round((y - camOffsetY) * zoom);

//     this.ctx.drawImage(imgSection.image,
//         sx, sy, sw, sh,
//         destX,
//         destY,
//         dw, dh
//     );


//     this.nFrames++;
// }

//idk

/**
 * Gets the width of the image, specifying the key, or will assume key 0. This is its width in pixels, not accounting for zoom
 */
RenderComponent.prototype.getWidth = function (key = 0) {
    return this.getSection().sw;
}
RenderComponent.prototype.getHeight = function (key = 0) {
    return this.getSection().sh;
}




// //called by user anytime
// //only this method is allowed to set RenderComponent's current image!
// /**
//  * Sets the ImageSlice or ImageStrip to be displayed on this entity. If ImageStrip, also specify which slide (0-indexed and wraps around n)
//  * @param {Number} slide will be truncated
//  */
// RenderComponent.prototype.setImageSection = function (is, slide = 0) {
//     if (
//         !HTMLImageSection.isImageSlice(is) && !HTMLImageSection.isImageStrip(is)
//     ) { throw "rip"; }

//     this.imageSection = is;

//     this.setSlide(slide);
//     return this;
// }

// /**
//  * Set the current slide of the current ImageSLICE to be displayed
//  */
// RenderComponent.prototype.setSlide = function (int) {
//     if (typeof int !== "number") {
//         throw "WOW";
//     }
//     this.currSlide = Math.floor(int);
// }

// var tileSize = 16;
// //STATIC///
// /**
//  * Sets the edge length of a tile in pixels used for 
//  */
// RenderComponent.setTileSize = function(ts = 16) {
//     tileSize = ts;
// }



//Module-scope static methods

/**
 * If a RC's context2D is not explicitly set, this will be the context it uses
 */
let setDefaultContext2D = function (ctx) {
    if (ctx instanceof CanvasRenderingContext2D) {
        defaultCtx = ctx;
    } else {
        throw "BRUH!";
    }
}

/**
 * If a RC's camera is not explicitly set, this will be the camera it uses.
 */
let setDefaultCamera = function (cam) {
    if (cam instanceof Camera2D) {
        defaultCam = cam;
    }
}

var remove = function (id) {
    renderComponents.delete(id);
}

/**
 * create a rendercomponent with default values. Set the ctx, images, camera, using the instance methods.
 * Ctx and at least 1 imagesection must be present in order for it to be drawn!
 *
 * @param {Number} id the entity ID
 */
function create(id) {
    // if (AssetLoader.getNumAssets === 0) {
    //     throw "can't create render component if there's no assets loaded";
    // }

    let rc = new RenderComponent(id);
    return rc;
}

function get(id) {
    return renderComponents.get(id);
}

var viewportWidth = 800;
var viewportHeight = 500;
/**
 * Set the size of the game viewport in actual pixels.
 * This is just to only draw entities in the actual viewport.
 * The default values for width and height are 800 and 500.
 * @param {number} width IN REAL PIXELS
 * @param {number} height IN REAL PIXELS
 */
function setViewingBounds(width, height) {
    viewportWidth = width;
    viewportHeight = height;
}
var drawAll = function () {
    let x = 0, y = 0;
    renderComponents.forEach(
        r => {
            //draw only if in bounds (it checks for screen coords NOT accounting for zoom)
            //debugger;
            if (r.pcRef) {
                //CENTERED, then moved by pcOffset
                r.x = r.pcRef.getAABBX() - (r.getWidth() - r.pcRef.getAABBWidth()) / 2 + r.pcOffX;
                r.y = r.pcRef.getAABBY() - (r.getHeight() - r.pcRef.getAABBHeight()) / 2 + r.pcOffY;
            }
            if (r.x + r.getWidth() >= r.camera.getExactX() && r.y + r.getHeight() >= r.camera.getExactY()
                && r.x <= r.camera.getExactX() + viewportWidth / Settings.ZOOM
                && r.y <= r.camera.getExactY() + viewportHeight / Settings.ZOOM) {

                //r.draw(x, y);
                let zoom = Settings.ZOOM;

                let imgSection = r.getSection();

                let sx = imgSection.sx,
                    sy = imgSection.sy,
                    sw = imgSection.sw,
                    sh = imgSection.sh,
                    dw = imgSection.sw * zoom,
                    dh = imgSection.sh * zoom;

                // for images with n=2 or higher, choose which slide
                if (imgSection.n >= 2) {
                    sx = imgSection.sx + (r.getSlide() % imgSection.n) * imgSection.sw;
                }

                let camOffsetX = 0, camOffsetY = 0;
                if (r.camera) {
                    //if canvas has a 2d camera, draw relative to the camera's pos
                    camOffsetX = r.camera.getExactX();
                    camOffsetY = r.camera.getExactY();
                }
                let destX = Math.round((r.x - camOffsetX) * zoom);
                let destY = Math.round((r.y - camOffsetY) * zoom);

                r.ctx.drawImage(imgSection.image,
                    sx, sy, sw, sh,
                    destX,
                    destY,
                    dw, dh
                );


                r.nFrames++;
            }
        }
    );
}

function getCount() {
    return renderComponents.size;
}
export {
    create, remove, get,
    drawAll,
    getCount, setDefaultContext2D, setDefaultCamera, setViewingBounds
}