import * as GameEntity from "../gameentity.js";
import * as Image from "../image.js";
import { Input, KeyCode } from "../input.js";

var Player = {};

Player.draw = function (ctx) { Player.gameEntity.draw(ctx); }
Player.update = function () {
    let speed = 1.69420 //2*Math.sqrt(2);
    let rad = 0;
    let up = Input.keyPressed(KeyCode.W),
        left = Input.keyPressed(KeyCode.A),
        down = Input.keyPressed(KeyCode.S),
        right = Input.keyPressed(KeyCode.D),
        pi = Math.PI;
    if (up && left && down && right) { console.log('all'); stop(); }
    if (up && left) { rad = 5 * pi / 4; }
    else if (up && right) { rad = 7 * pi / 4; }
    else if (down && left) { rad = 3 * pi / 4; }
    else if (down && right) { rad = pi / 4; }
    else if (up && down || left && right) { rad = null; }
    else if (up) { rad = 3 * pi / 2; }
    else if (left) { rad = pi; }
    else if (down) { rad = pi / 2; }
    else if (right) { rad = 2 * pi; }
    else { rad = null; } //didnt move
    if (rad) {
        Player.gameEntity.hitbox.setVelocityRT(speed, rad);
    } else {
        Player.gameEntity.hitbox.setVelocity(0,0);
    }
}
Player.init = function () {
    Player.gameEntity = GameEntity.newActorEntity(50, 50, Image.IMAGE.NPC1, 0, 16, 16, 16);
}

export { Player };