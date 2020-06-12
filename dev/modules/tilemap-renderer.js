import { ReadMapData } from "./read-mapdata.js";
import { TILE_SIZE, V_WIDTH, V_HEIGHT, STEP, ZOOM } from "./globals.js"
import { Camera } from "./camera.js";
//Renders the tiles!
//May do optimizations later!
//For now, it just picks the tiles that are within the screen bounds and only renders those!!
var TileMapRenderer = {};

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {HTMLImageElement} tilesetImage
 * @param {Number} tilesetTWidth width of the tileset in tiles.
 */
function render(ctx, tilesetImage, tilesetTWidth) {
    //only render visible tiles.
    tilesetTWidth = tilesetTWidth || 16;
    let x, y, id, //x: x coodinate of the map array.
        xi = Math.floor(Camera.getExactX() / TILE_SIZE), //these 4 are in units of tiles.
        xf = Math.ceil((Camera.getExactX() + V_WIDTH) / TILE_SIZE),
        yi = Math.floor(Camera.getExactY() / TILE_SIZE),
        yf = Math.ceil((Camera.getExactY() + V_HEIGHT) / TILE_SIZE);
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
                        (x * TILE_SIZE - Camera.getX()) * ZOOM,
                        (y * TILE_SIZE - Camera.getY()) * ZOOM,
                        TILE_SIZE * ZOOM,
                        TILE_SIZE * ZOOM);

                }
            }
        }
    }
}

TileMapRenderer.render = render;
export { TileMapRenderer };