
const TILE_SIZE = 16;
const RESOLUTIONS = {
    trash: { w: 800, h: 600 },
    HD: { w: 1280, h: 720 },
    FHD: { w: 1920, h: 1080 },
    QHD: { w: 2560, h: 1440 }
}
var res = RESOLUTIONS.HD;
var V_WIDTH = res.w;
var V_HEIGHT = res.h;
const ZOOM = 2; //INTEGERS 1+ ONLY! Game logic/physics takes place with zoom=1, but all the rendering at zoom=n.
const STEP = 1 / 60;
export { TILE_SIZE, V_WIDTH, V_HEIGHT, STEP, ZOOM };