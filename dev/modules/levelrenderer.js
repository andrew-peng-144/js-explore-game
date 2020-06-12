var lr = {};

var old_tileMapCanvas = document.createElement('canvas'),
    old_tileMapCC = old_tileMapCanvas.getContext('2d');


var pixMap = document.createElement('canvas'),
    pixMapContext = pixMap.getContext('2d'),

    currentMapData = []; //2d array: 2 indices, value is {tx,ty}


lr.blocks = [];
//convert the image pixmap into a numeric array

lr.loadLevelNEW = function (mapID) {
    MAPS[mapID]//TODO
}

lr.loadLevel = function (mapFile) {
    console.log("loadLevelBegin");

    //make tiles 2d arr
    var map = assets[mapFile];
    var x, y, color, image;

    // for (let i = 0; i < map.width; i++)
    //   currentMapData.push([]); //2d

    var color;
    //new temp. canvas for map img
    pixMapContext.clearRect(0, 0, pixMap.width, pixMap.height);
    pixMap.width = map.width;
    pixMap.height = map.height;
    pixMapContext.imageSmoothingEnabled = false;
    pixMapContext.drawImage(map, 0, 0, map.width, map.height);
    //pixMapContext.drawImage(map, 0, 0, 1000, 1000);
    for (let i = 0; i < map.width; i++)
        currentMapData.push([]);

    //loop thru entire map and convert each pixel to number
    var tc = Color.Pixmap;
    for (x = 0; x < map.width; x++) {
        for (y = 0; y < map.height; y++) {
            //color = colorAt(x, y);
            //color = Utils.randomChoice([tc.Grass,tc.Stone,tc.Sand,tc.Water]);
            color = tc.Grass;
            //image = null;
            switch (color) { //lowercase
                case 0://test
                    image = IMAGE.BRICK2;
                    break;
                case tc.Grass:
                    image = IMAGE.GRASS;
                    break;
                case tc.Stone:
                    image = IMAGE.STONE;
                    break;
                case tc.Sand:
                    image = IMAGE.SAND;
                    break;
                case tc.Water:
                    image = IMAGE.WATER;
                    //this.blocks.push(physics.newHitbox(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE,TILE_SIZE, null, physics.Type.BLOCK, true));
                    break;


            }
            if (image) {
                placeTileData(image, x, y);
            }
        }
    }
    // function placeTileData(x, y, xOnTileSet, yOnTileSet) {
    //   //console.log(x);
    //   currentMapData[x][y] = { tsx: xOnTileSet, tsy: yOnTileSet };
    // }
    function placeTileData(tileImage, x, y) {
        currentMapData[x][y] = tileImage;
    }


    // lr.blocks.push(physics.newHitbox(16, 16, 16, 16, null, physics.Type.BLOCK, true));
    // lr.blocks.push(physics.newHitbox(16, 16 * 2, 16, 16, null, physics.Type.BLOCK, true));
    // lr.blocks.push(physics.newHitbox(16 * 2, 16, 16, 16, null, physics.Type.BLOCK, true));
    // lr.blocks.push(physics.newHitbox(16 * 2, 16 * 2 - 5, 16, 16, null, physics.Type.BLOCK, true));
    physics.newBlock(0, 60, 30, 30, true);
    physics.newSlopeBlock(30, 60, 30, 30, 2);
    physics.newSlopeBlock(60, 90, 30, 30, 2);
    physics.newBlock(90, 120, 50, 50, true);
    physics.newBlock(90, 171, 50, 50, true);
    physics.newBlock(90, 222, 50, 50, true);
    physics.newBlock(141, 222, 50, 50, true);
    physics.newBlock(192, 222, 50, 50, true);
    //physics.newBlock(50, 50, 50, 50);
    // var kek = physics.newHitbox(0, 0, 20, 20, null, physics.Type.BLOCK, false);
    // kek.setAcceleration(0.01, 0);
    ingame.enemyHandler.newEnemy(500, 500);
    ingame.enemyHandler.newEnemy(250, 250);
    ingame.enemyHandler.newEnemy(300, 350);

    // ingame.enemyHandler.newEnemy()
    //  // .withHitbox(100, 100, 16, 16)
    //   .withImage(IMAGE.LINKIN)
    //   .withHealth(5)
    //   .withDamage(5);


    console.log("loadLevelEnd");
}
lr.renderLevel = function () {

    //only render visible tiles.
    var x, y, md,
        xi = Math.floor(camera.getExactX() / TILE_SIZE), //these 4 are in units of tiles.
        xf = Math.ceil((camera.getExactX() + C.bufferCanvas.width) / TILE_SIZE),
        yi = Math.floor(camera.getExactY() / TILE_SIZE),
        yf = Math.ceil((camera.getExactY() + C.bufferCanvas.height) / TILE_SIZE);
    //console.log("xi " + xi + " xf " + xf + " yi " + yi + " yf" + yf);

    for (x = xi; x < xf; x++) {
        for (y = yi; y < yf; y++) {

            if (currentMapData[x] && currentMapData[x][y]) { //The tile exists.
                md = currentMapData[x][y];
                ingame.drawStillImageToWorld(md, x * TILE_SIZE, y * TILE_SIZE);

            }
        }
    }
}

lr.getCurrentMapData = function () {
    return currentMapData;
}

lr.old_getTileMapCanvas = function () { return old_tileMapCanvas; };
