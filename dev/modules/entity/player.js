import * as MyAssetLoader from "../myassetloader.js";
import * as ImageDef from "../imagedef.js";
import * as Engine from "../../engine/engine.js";
import * as KeyCode from "../misc/keycode.js";
import * as CanvasManager from "../canvas-manager.js";

var Player = {};

var MovementAnimState = {
    curr: 0,
    STILL: 0,
    SOUTH: 3
}

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
            .withPhysicsComponent(Engine.Entity.PhysicsComponent.newOptions()
                .addRectHitbox(100, 0, 5, 5, 1)
                .addRectHitbox(100, 10, 5, 5, 1)
                .setControlFunc(bulletTestControl)
                //.setOnCollideFunc((otherIndex, data) => { bul.queueDelayedRemove() })
            )
            .withRenderComponent(Engine.Entity.RenderComponent.createRenderComponent()
                .setContext2D(CanvasManager.Context.main)
                .setCamera(mainCamera)
                .addImageSection(ImageDef.sections().BLUE_ORB, 0)
            )
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

    if (keysJust.has(KeyCode.S)) {
        //anim walk south
        entity.renderComponent.setCurrGraphic(1);
    }

    //MovementAnimState.curr = MovementAnimState.STILL;

    if (w && a && s && d) { console.log('all'); speed = 0; return; }
    if (w && a) { dir = 5 * pi / 4; }
    else if (w && d) { dir = 7 * pi / 4; }
    else if (s && a) { dir = 3 * pi / 4; }
    else if (s && d) { dir = pi / 4; }
    else if (w && s || a && d) { speed = 0; return; }
    else if (w) { dir = 3 * pi / 2; }
    else if (a) { dir = pi; }
    else if (s) { dir = pi / 2;
    
    ///////////////////////////////////
    //MovementAnimState.curr = MovementAnimState.SOUTH;

    }
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

    let ic = Engine.Entity.InputComponent.createInputComponent()
        .setKeyCallback(playerKeyCallback)
        .setMouseCallback(CanvasManager.Canvas.main, playerMouseCallback);

    entity = Engine.Entity.createEntity(50, 200)
        .withInputComponent(ic)
        .withPhysicsComponent(Engine.Entity.PhysicsComponent.newOptions()
            .addRectHitbox(0, 0, 10, 10, 0, 1)
            .setCollisionDataFunc(function () { return "u hit the player lmfao"; })
            .setControlFunc(function (controller) {

                controller.setDX(speed * Math.cos(dir));
                controller.setDY(speed * Math.sin(dir));
            })
            .setOnCollideFunc(function (i, otherData) {
                //console.log("I am player and I bumped into someone's " + i + "th hitbox. Their message is: " + otherData);
            }))


        .withRenderComponent(Engine.Entity.RenderComponent.createRenderComponent()
            .setCamera(camera)
            .setContext2D(CanvasManager.Context.main)
            .addImageSlice(ImageDef.sections().NPC1, 0)
            .addAnimation(ImageDef.sections().NPC1_WALKING_SOUTH, 1, 9)
            .setCurrGraphic(0)
        )
}

function getEntityX() {
    return entity.getX();
}
function getEntityY() {
    return entity.getY();
}

export { init, getEntityX, getEntityY };