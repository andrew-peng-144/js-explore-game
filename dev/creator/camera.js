

var c = {};

var exactX = 0, exactY = 0;
c.getExactX = function () {
    return exactX;
} //idk
c.getExactY = function () {
    return exactY;
}
c.getX = function () {
    return Math.round(exactX);
}
c.getY = function () {
    return Math.round(exactY);
}


c.up = false;
c.down = false;
c.left = false;
c.right = false;
/**
 * Updates the position of the camera:
 * locks it to the player or stops at edge of map.
 */
c.update = function () {
    let speed = 16;
    // if (keycode == 87) {
    //     exactY -= speed;
    // }
    // if (keycode == 65) {
    //     exactX -= speed;
    // }
    // if (keycode == 83) {
    //     exactY += speed;
    // }
    // if (keycode == 68) {
    //     exactX += speed;
    // }
    let moved = false;
    if (this.up) {
        exactY -= speed; moved = true;
    }
    if (this.left) {
        exactX -= speed; moved = true;
    }
    if (this.down) {
        exactY += speed; moved = true;
    }
    if (this.right) {
        exactX += speed; moved = true;
    }
    return moved;
    // exactX = player.getX() - canvas.width / 2 + player.gameObject.getSpriteWidth() / 2;
    // exactY = player.getY() - canvas.height / 2 + player.gameObject.getSpriteHeight() / 2;
    // if (camera.x < 0) camera.x = 0;
    // if (camera.x > map.width * TILEWIDTH - canvas.width) camera.x = map.width * TILEWIDTH - canvas.width;
    // if (camera.y < 0) camera.y = 0;
    // if (camera.y > map.height * TILEHEIGHT - canvas.height) camera.y = map.height * TILEHEIGHT - canvas.height;
}

c.onKeyDown = function (keyCode) {
    if (keyCode == 87) {
        this.up = true;
    }
    if (keyCode == 65) {
        this.left = true;
    }
    if (keyCode == 83) {
        this.down = true;
    }
    if (keyCode == 68) {
        this.right = true;
    }
};
c.onKeyUp = function (keyCode) {
    if (keyCode == 87) {
        this.up = false;
    }
    if (keyCode == 65) {
        this.left = false;
    }
    if (keyCode == 83) {
        this.down = false;
    }
    if (keyCode == 68) {
        this.right = false;
    }
};
export { c as Camera };