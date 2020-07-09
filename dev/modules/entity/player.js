import { GameEntity } from "../gameentity.js";
import { Hitbox } from "../hitbox.js";
import * as Image from "../imagedef.js";
import { Input, KeyCode } from "../input.js";
import { State, StateMachine } from "../state-machine.js";
import {Sprite} from "../sprite.js";



var Player = {};

// var MovementState = {
//     STILL: 0,
//     RUNNING: 1,
//     CLIMBING_LADDER: 2,
//     UNCONTROLLABLE: 3,
//     IDKLMFAO: 4
// }
//Player.currentState = 0;

Player.draw = function (ctx) {debugger;
    Player.gameEntity.sprites[Player.stateMachine.currentStateIndex].draw(ctx);
}
function drawBasedOnDirection() {

}
Player.update = function () {
    this.stateMachine.update();
}
Player.init = function () {
    Player.gameEntity = GameEntity.create(50, 50)
        .withHitbox(
            Hitbox.create()
                .shapeRectangle(0, 0, 20, 20)
                .hasType(1)
        )
        .withSprite(
            new Sprite(Image.IMAGE.WALKING_LEFT_TEST),
            5,
            5
        )
        .withSprite(
            new Sprite(Image.IMAGE.WALKING_RIGHT_TEST),
            5,
            5
        )
        .withSprite(
            new Sprite(Image.IMAGE.WALKING_DOWN_TEST),
            5,
            5
        );

    Player.stateMachine = new StateMachine(
        [
            new State(
                'stopped',
                () => { },
                () => { },
                () => { }
            ),
            new State(
                'move',
                () => { },
                () => {
                    handleMovement();
                },
                () => { }
            )
        ]
    );
}

function handleMovement() {
    let speed = 2.69420//1*Math.sqrt(2);
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
        Player.gameEntity.setVelocityRT(speed, rad);
        Player.stateMachine.changeState(1);
    } else {
        Player.gameEntity.setVelocity(0, 0);
        Player.stateMachine.changeState(0);
    }
}

Player.handleCollisionWithBlock = function (block) {
    console.log(block);
}

export { Player };