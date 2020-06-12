import {Input, KeyCode} from "./input.js";
var c = {};

var exactX = 0, exactY = 0;
c.getExactX = function () {
    return exactX;
} //idk
c.getExactY = function () {
    return exactY;
}
c.getX = function() {
    return Math.round(exactX);
}
c.getY = function() {
    return Math.round(exactY);
}
/**
 * Updates the position of the camera:
 * locks it to the player or stops at edge of map.
 */
c.update = function () {
    var speed = 3.32323;
    if (Input.keyPressed(KeyCode.UP)) {
        exactY-=speed;
    }
    if (Input.keyPressed(KeyCode.LEFT)) {
        exactX-=speed;
    }
    if (Input.keyPressed(KeyCode.DOWN)) {
        exactY+=speed;
    }
    if (Input.keyPressed(KeyCode.RIGHT)) {
        exactX+=speed;
    }
    // exactX = player.getX() - canvas.width / 2 + player.gameObject.getSpriteWidth() / 2;
    // exactY = player.getY() - canvas.height / 2 + player.gameObject.getSpriteHeight() / 2;
    // if (camera.x < 0) camera.x = 0;
    // if (camera.x > map.width * TILEWIDTH - canvas.width) camera.x = map.width * TILEWIDTH - canvas.width;
    // if (camera.y < 0) camera.y = 0;
    // if (camera.y > map.height * TILEHEIGHT - canvas.height) camera.y = map.height * TILEHEIGHT - canvas.height;
}
export {c as Camera};