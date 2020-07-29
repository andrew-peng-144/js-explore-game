

function Camera2D() {
    this._exactX = 0;
    this._exactY = 0;
}

Camera2D.prototype.getExactX = function () {
    return this._exactX;
} //idk
Camera2D.prototype.getExactY = function () {
    return this._exactY;
}
Camera2D.prototype.getRoundedX = function () {
    return Math.round(this._exactX);
}
Camera2D.prototype.getRoundedY = function () {
    return Math.round(this._exactY);
}
/**
 * Updates the position of the camera:
 * locks it to the player
 * // TODO: smoother camera movement.
 * @param width the width of what area the camera should view (usually the entire viewport)
 */
Camera2D.prototype.update = function () {
    // var speed = 3.32323;
    // if (Input.keyPressed(KeyCode.UP)) {
    //     exactY-=speed;
    // }
    // if (Input.keyPressed(KeyCode.LEFT)) {
    //     exactX-=speed;
    // }
    // if (Input.keyPressed(KeyCode.DOWN)) {
    //     exactY+=speed;
    // }
    // if (Input.keyPressed(KeyCode.RIGHT)) {
    //     exactX+=speed;
    // }

    // this.exactX = player.gameEntity.x + player.gameEntity.renderComponent.offsetX - width / 2 + player.gameEntity.renderComponent.getWidth() / 2;
    // this.exactY = player.gameEntity.y + player.gameEntity.renderComponent.offsetY - height / 2 + player.gameEntity.renderComponent.getHeight() / 2;
    // if (camera.x < 0) camera.x = 0;
    // if (camera.x > map.width * TILEWIDTH - canvas.width) camera.x = map.width * TILEWIDTH - canvas.width;
    // if (camera.y < 0) camera.y = 0;
    // if (camera.y > map.height * TILEHEIGHT - canvas.height) camera.y = map.height * TILEHEIGHT - canvas.height;
}

Camera2D.prototype.setPosition = function (x, y) {
    this._exactX = x;
    this._exactY = y;
}

function createCamera2D() {
    return new Camera2D();
}
export { createCamera2D };