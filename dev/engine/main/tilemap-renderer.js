import * as ReadMapData from "./read-mapdata.js";
import * as Settings from "../settings.js";
//import { TILE_SIZE, V_WIDTH, V_HEIGHT, STEP, ZOOM } from "../modules/globals.js"
//import { Camera } from "./camera.js";

//TODO a way to set the canvas (tat has a camera).
//Renders the tiles!
//May do optimizations later!
//For now, it just picks the tiles that are within the screen bounds and only renders those!!

/**
 * @param {HTMLImageElement} tilesetImage
 * @param {Number} tilesetTWidth width of the tileset in tiles.
 */
function renderVisibleTiles(canvas, camera, tilesize, tilesetImage, tilesetTWidth) {
    if (typeof canvas !== "HTMLCanvasElement") {
        throw "bruh";
    }
    let ctx = canvas.getContext("2d");
    let TILE_SIZE = tilesize;
    let ZOOM = Settings.ZOOM;

    //only render visible tiles.
    tilesetTWidth = tilesetTWidth || 16;
    let x, y, id, //x: x coodinate of the map array.
        xi = Math.floor(camera.getExactX() / TILE_SIZE), //these 4 are in units of tiles.
        xf = Math.ceil((camera.getExactX() + canvas.width) / TILE_SIZE),
        yi = Math.floor(camera.getExactY() / TILE_SIZE),
        yf = Math.ceil((camera.getExactY() + canvas.height) / TILE_SIZE);
    //console.log("xi " + xi + " xf " + xf + " yi " + yi + " yf" + yf);
    var arr = ReadMapData.mapArr;
    for (x = xi; x < xf; x++) {
        for (y = yi; y < yf; y++) {
            if (x >= 0 && y >= 0 && x < ReadMapData.mapTWidth) { //prevent looping...
                id = arr[x + ReadMapData.mapTWidth * y];
                if (id > 0) {
                    ctx.drawImage(tilesetImage,
                        (id - 1) % tilesetTWidth * TILE_SIZE,
                        Math.floor((id - 1) / tilesetTWidth) * TILE_SIZE,
                        TILE_SIZE,
                        TILE_SIZE,
                        (x * TILE_SIZE - camera.getX()) * ZOOM,
                        (y * TILE_SIZE - camera.getY()) * ZOOM,
                        TILE_SIZE * ZOOM,
                        TILE_SIZE * ZOOM);

                }
            }
        }
    }
}

export { renderVisibleTiles };