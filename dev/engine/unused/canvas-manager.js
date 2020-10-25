import { Camera2D } from "../main/camera2D.js";

/*
THIS IS UNNEEDED, WITH THE DECISION TO MAKE THE USER HAVE CONTROL OVER THEIR GAMESTATE IMPLMENETATION.


a place to add canvases for the engine to deal with, when rendering
Each canvas comes with options.

lists canvas and associated data for each canvas...
*/
let canvasDataList = {};

function CanvasSettings() {
    this.isIdk = false;
    //this.clearEveryFrame = true;
    this.camera = null;
    this.zoom = 1;
}

CanvasSettings.prototype.placeholderIdk = function (w) {
    this.isIdk = w;
    return this;
}
// CanvasSettings.prototype.setClearEveryFrame = function(bool) {
//     this.clearEveryFrame = bool;
//     return this;
// }
CanvasSettings.prototype.setZoom = function (zoom) {
    this.zoom = zoom;
    return this;
}

/**
 * set camera2D for now. must be the one from camera2D.js
 * @param {Camera2D} cam 
 */
CanvasSettings.prototype.setCamera = function (cam) {
    if (cam.constructor.name !== Camera2D.name) {
        throw "must be Camera2D type (Obviously can be spoofed but just dont pls:) )";
    }
    this.camera = cam;
    return this;
}

/**
 * @return settings that u can apply methods to change settingz
 * @param {*} canvas 
 * @param {Number} id some number that represents this canvas, which you have to save to refer to later.
 */
function addCanvas(canvas, id) {
    canvases[id] = canvas;
    contexts[id] = canvas.getContext("2d");
    let cs = new CanvasSettings();
    canvasDataList[id] = {
        canvas: canvas,
        context: canvas.getContext("2d"),
        settings: cs
    };

    return cs;
}

function getCanvasData(id) {
    return canvasDataList[id];
}

function getNumCanvases() {
    return canvasDataList.length;
}
function clearCanvases() {
    canvasDataList.forEach(canvasData => {
        canvasData.context.clearRect(0, 0, canvasData.canvas.width, canvasData.canvas.height);
    });
}
return { addCanvas, getCanvasData, getNumCanvases, clearCanvases }