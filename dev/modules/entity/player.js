import * as MyAssetLoader from "../myassetloader.js";
import * as ImageDef from "../imagedef.js";
import * as Engine from "../../engine/engine.js";
import * as KeyCode from "../misc/keycode.js";
import * as CanvasManager from "../canvas-manager.js";

var Player = {};

// var MovementState = {
//     STILL: 0,
//     RUNNING: 1,
//     CLIMBING_LADDER: 2,
//     UNCONTROLLABLE: 3,
//     IDFKLMFAO: 4
// }
// Player.currentState = 0;

// // Player.draw = function (ctx) {
// //     switch (MovementState) {
// //         case MovementState.STILL: break;
// //     }
// //     Player.gameEntity.draw(ctx);

// // }

// Player.update = function () {
//     // let speed = 2.69420//1*Math.sqrt(2);
//     // let rad = 0;
//     // let up = Input.keyPressed(KeyCode.W),
//     //     left = Input.keyPressed(KeyCode.A),
//     //     down = Input.keyPressed(KeyCode.S),
//     //     right = Input.keyPressed(KeyCode.D),
//     //     pi = Math.PI;
//     // if (up && left && down && right) { console.log('all'); stop(); }
//     // if (up && left) { rad = 5 * pi / 4; }
//     // else if (up && right) { rad = 7 * pi / 4; }
//     // else if (down && left) { rad = 3 * pi / 4; }
//     // else if (down && right) { rad = pi / 4; }
//     // else if (up && down || left && right) { rad = null; }
//     // else if (up) { rad = 3 * pi / 2; }
//     // else if (left) { rad = pi; }
//     // else if (down) { rad = pi / 2; }
//     // else if (right) { rad = 2 * pi; }
//     // else { rad = null; } //didnt move
//     // if (rad) {

//     //     //Player.gameEntity.hitbox.setVelocityRT(speed, rad);
//     //     Player.gameEntity.kinematicComponent.setVelocityRT(speed, rad);
//     //     this.currentState = MovementState.RUNNING;
//     // } else {
//     //     //Player.gameEntity.hitbox.setVelocity(0, 0);
//     //     Player.gameEntity.kinematicComponent.setVelX(0).setVelY(0);
//     //     this.currentState = MovementState.STILL;
//     // }
// }
let dir = 0; //reveresed radians
const maxSpeed = 1.69;
let speed = 0;

let w, a, s, d, pi = Math.PI;

let entity;

function bulletTestControl(controller) {
    controller.setDX(1);
}

let bulletLifetime = 1000; //frames
function playerKeyCallback(keysDown, keysJust) {

    if (keysDown.has(KeyCode.E)) {
        //shoot test

        let startFrames = Engine.getFramesElapsed();
        let bul = Engine.Entity.createEntity(getEntityX(), getEntityY())
            .withPhysicsComponent(Engine.Entity.newPhysicsOptions()
                .addRectHitbox(100, 0, 5, 5, 1)
                .addRectHitbox(100, 10, 5, 5, 1)
                .setControlFunc(bulletTestControl)
                //.setOnCollideFunc((otherIndex, data) => { bul.queueDelayedRemove() })
            )
            .withRenderComponent(
                CanvasManager.Context.main,
                ImageDef.issToImageSection(ImageDef.imageStringSections.BLUE_ORB, MyAssetLoader.assets),
                mainCamera)
            .withBehavior(
                () => {
                    if (Engine.getFramesElapsed() - startFrames === bulletLifetime) {
                        //console.log("REMOVE");
                        bul.queueDelayedRemove();
                    }
                }
            )
    }

    w = keysDown.has(KeyCode.W);
    a = keysDown.has(KeyCode.A);
    s = keysDown.has(KeyCode.S);
    d = keysDown.has(KeyCode.D);

    if (w && a && s && d) { console.log('all'); speed = 0; return; }
    if (w && a) { dir = 5 * pi / 4; }
    else if (w && d) { dir = 7 * pi / 4; }
    else if (s && a) { dir = 3 * pi / 4; }
    else if (s && d) { dir = pi / 4; }
    else if (w && s || a && d) { speed = 0; return; }
    else if (w) { dir = 3 * pi / 2; }
    else if (a) { dir = pi; }
    else if (s) { dir = pi / 2; }
    else if (d) { dir = 2 * pi; }
    else { speed = 0; return; } //didnt move
    speed = maxSpeed;
}


let test = false;
function playerMouseCallback(mousePos, mouseButtonsDown, just) {
    if (just.size > 0) {
        console.log(mousePos);
        //console.log(mouseButtonsDown);
    }
}
let mainCamera;
let init = function (camera) {
    mainCamera = camera;
    // Player.gameEntity = Engine.Entity.createEntity(50, 60)
    //     //.withRectActorHitbox(34.69, 52.345345, Hitbox.Category.PLAYER )
    //     .withRenderComponent(ImageDef.issToImageSection(ImageDef.imageStringSections.BLAZEN, MyAssetLoader.assets))
    //     //.withKinematicComponent();






    let ic = Engine.Entity.createInputComponent()
        .setKeyCallback(playerKeyCallback)
        .setMouseCallback(CanvasManager.Canvas.main, playerMouseCallback);

    entity = Engine.Entity.createEntity(50, 200)
        .withInputComponent(ic)
        .withPhysicsComponent(Engine.Entity.newPhysicsOptions()
            .addRectHitbox(0, 0, 10, 10, 0, 1)
            .setCollisionDataFunc(function () { return "u hit the player lmfao"; })
            .setControlFunc(function (controller) {

                controller.setDX(speed * Math.cos(dir));
                controller.setDY(speed * Math.sin(dir));
            })
            .setOnCollideFunc(function (i, otherData) {
                //console.log("I am player and I bumped into someone's " + i + "th hitbox. Their message is: " + otherData);
            }))
        .withRenderComponent(
            CanvasManager.Context.main,
            ImageDef.issToImageSection(ImageDef.imageStringSections.BLUE_ORB, MyAssetLoader.assets),
            camera
        )
}

function getEntityX() {
    return entity.getX();
}
function getEntityY() {
    return entity.getY();
}

export { init, getEntityX, getEntityY };