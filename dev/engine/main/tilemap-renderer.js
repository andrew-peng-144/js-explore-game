//import * as ReadMapData from "./read-mapdata.js";
import * as Settings from "../settings.js";
//import { TILE_SIZE, V_WIDTH, V_HEIGHT, STEP, ZOOM } from "../modules/globals.js"
//import { Camera } from "./camera.js";

//TODO a way to set the canvas (tat has a camera).
//Renders the tiles!
//May do optimizations later!
//For now, it just picks the tiles that are within the screen bounds and only renders those!!

//let canvas, camera, tilesize, tilesetImage, tilesetTWidth, mapArr;

let settingsObj = {
    canvas: null,
    camera: null,
    mapArr: null,
    mapTWidth: 0,
    tilesetImage: null,
    tilesize: null
};

settingsObj.setCanvas = function (c) {
    if (!(c instanceof HTMLCanvasElement)) {
        throw "bruh";
    }
    this.canvas = c;
    return this;
};
settingsObj.setCamera = function (c) {
    if (typeof c._exactX === undefined || typeof c._exactY === undefined) {
        throw "bruh";
    }
    this.camera = c;
    return this;
};
settingsObj.setMapArray = function (m) {
    if (!(m instanceof Array)) {
        throw "bruh";
    }
    this.mapArr = m;
    return this;
};
settingsObj.setTilesetImage = function (i) {
    if (!(i instanceof HTMLImageElement)) {
        throw "bruh";
    }
    this.tilesetImage = i;
    return this;
};
settingsObj.setTilesize = function (t) {
    if (typeof t !== "number") {
        throw "bruh";
    }
    this.tilesize = t;
    return this;
};
settingsObj.setMapTWidth = function (m) {
    if (typeof m !== "number") {
        throw "bruh";
    }
    this.mapTWidth = m;
    return this;
}

/**
 * Must set all.
 */
function settings() {
    return settingsObj;
}


/**
 * @param {HTMLImageElement} tilesetImage an HTML image element of the TileSet.
 * @param {Number} tilesetTWidth width of the tileset in tiles.
 */
function renderVisibleTiles() {


    //let TILE_SIZE = tilesize;
    let ZOOM = Settings.ZOOM;

    let canvas = settingsObj.canvas;
    let camera = settingsObj.camera;
    let mapArr = settingsObj.mapArr;
    let tilesetImage = settingsObj.tilesetImage;
    let TILE_SIZE = settingsObj.tilesize;
    let mapTWidth = settingsObj.mapTWidth;

    if (!canvas || !camera || !mapArr || !tilesetImage || !TILE_SIZE || !mapTWidth) {
        throw "Must set all settings before attempting to render tilemap";
    }
    let ctx = canvas.getContext("2d");

    //only render visible tiles.
    let tilesetTWidth = tilesetImage.width / TILE_SIZE;
    let x, y, id, //x: x coodinate of the map array.
        xi = Math.floor(camera.getExactX() / TILE_SIZE), //these 4 are in units of tiles.
        xf = Math.ceil((camera.getExactX() + canvas.width) / TILE_SIZE),
        yi = Math.floor(camera.getExactY() / TILE_SIZE),
        yf = Math.ceil((camera.getExactY() + canvas.height) / TILE_SIZE);
    //console.log("xi " + xi + " xf " + xf + " yi " + yi + " yf" + yf);
    var arr = settingsObj.mapArr;

    for (x = xi; x < xf; x++) {
        for (y = yi; y < yf; y++) {
            if (x >= 0 && y >= 0 && x < mapTWidth) { //prevent looping...
                id = arr[x + mapTWidth * y];
                if (id > 0) {
                    ctx.drawImage(tilesetImage,
                        (id - 1) % tilesetTWidth * TILE_SIZE,
                        Math.floor((id - 1) / tilesetTWidth) * TILE_SIZE,
                        TILE_SIZE,
                        TILE_SIZE,
                        Math.round(((x * TILE_SIZE) - camera.getExactX()) * ZOOM),
                        Math.round(((y * TILE_SIZE) - camera.getExactY()) * ZOOM),
                        TILE_SIZE * ZOOM,
                        TILE_SIZE * ZOOM);

                }
            }
        }
    }
}

export { renderVisibleTiles, settings };