var c = {};

var exactX = 0, exactY = 0;
var player = ingame.player, canvas = C.bufferCanvas;
c.getExactX = function () {
    return Math.round(exactX);
} //idk
c.getExactY = function () {
    return Math.round(exactY);
}
/**
 * Updates the position of the camera:
 * locks it to the player or stops at edge of map.
 */
c.update = function () {
    exactX = player.getX() - canvas.width / 2 + player.gameObject.getSpriteWidth() / 2;
    exactY = player.getY() - canvas.height / 2 + player.gameObject.getSpriteHeight() / 2;
    // if (camera.x < 0) camera.x = 0;
    // if (camera.x > map.width * TILEWIDTH - canvas.width) camera.x = map.width * TILEWIDTH - canvas.width;
    // if (camera.y < 0) camera.y = 0;
    // if (camera.y > map.height * TILEHEIGHT - canvas.height) camera.y = map.height * TILEHEIGHT - canvas.height;
}
export {c as Camera};