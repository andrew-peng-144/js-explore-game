import * as MyAssetLoader from "../myassetloader.js";
import * as ImageDef from "../imagedef.js";
import * as Engine from "../../engine/engine.js";
import * as KeyCode from "../misc/keycode.js";
import * as CanvasManager from "../canvas-manager.js";

import * as EntityState from "./entitystate.js";

import * as Counter from "../misc/counter.js";

// var MovementAnimState = {
//     curr: 0,
//     STILL: 0,
//     NORTH: 1,
//     EAST: 2,
//     SOUTH: 3,
//     WEST: 4,
// }

var animCounter = Counter.create();
var animWalkDelay = 9;

const player_maxSpeed = 1.9869420;
let player_speed = 0;
let player_direction = 0; //reversed radians

let up, left, down, right, pi = Math.PI;

let eID = 0;

let mainCamera;

// // let fsm;
// // let fsm_idle = 1, fsm_walk = 2, fsm_attack = 3;
// let currEntityState = null;

let bulletLifetime = 100; //frames

let init = function (camera, initX = 0, initY = 0) {
    mainCamera = camera;


    //setup entity components...
    eID = Engine.GameEntity.createEntity();
    debugger;
    let ic = Engine.InputComponent.create(eID)
        .setKeyCallback(playerKeyCallback)
        .setMouseCallback(CanvasManager.Canvas.main, playerMouseCallback);



    let playerController = { dx: 0, dy: 0 }
    let playerHitboxWidth = 8;
    let playerHitboxHeight = 12;

    //let player_prev_pos = { x: 0, y: 0 };
    let slideToSetTo = 0;

    let playerAnimCounter = Counter.create();
    let pc = Engine.PhysicsComponent.create(eID)
        .setRectangleHitbox(initX, initY, playerHitboxWidth, playerHitboxHeight)
        .setControlFunc(() => {

            playerController.dx = player_speed * Math.cos(player_direction);
            playerController.dy = player_speed * Math.sin(player_direction);
            return playerController;
        })
        .setOnCollideFunc((type, data) => {

        })
        .setCollisionDataFunc(() => { return "u hit the player lmfao"; })
        .setPostMoveUpdate((dx, dy) => {
            // if (Engine.getFramesElapsed() % 30 === 0) {
            //     console.log("player dx: " + dx + ", dy: " + dy);
            // }

            if (dx === 0 && dy === 0) {
                //didn't move... keep prev direction but keep it rendering the "idle" state of the anim (2nd slide for player (index 1))
                rc.setSlide(1);
                
                //also reset anim timer when idle so next step will always goto 1 instead of continuing, when spamming 1 direection
                playerAnimCounter.lap();
                return;
            }


            //set the correct moving sprite direction based on true direction of movement.
            let dir = Math.atan2(dy, dx); //inverted y axis means unitcircle goes clockwise from (1,0). atan2 returns (-pi, pi]
            if (dir > -Math.PI / 4 && dir < Math.PI / 4) {
                //right
                handleDir(4);
            }
            else if (dir >= Math.PI / 4 && dir <= 3 * Math.PI / 4) {
                //down (closed interval for both checks so exactly down-left and down-right will goto down anim.)
                handleDir(3);
            } else if (dir >= -3 * Math.PI / 4 && dir <= -Math.PI / 4) {

                //up
                handleDir(1);
            } else {
                //left
                handleDir(2);
            }
        });

    let rc = Engine.RenderComponent.create(eID)
        .setCamera(camera)
        // .setGetSection(() => { return ImageDef.sections().NPC1 })
        // .setGetSlide(() => { return slideToSetTo; })
        .setSection(ImageDef.sections().NPC1)
        .linkPosToPhysics(pc, 0, -7);

    let prevDir = 0; //up left down right 1234
    let handleDir = function (dir) {
        if (dir !== prevDir) {
            //dir changed. reset timer and do new dir
            playerAnimCounter.lap();
            rc.setSlide(0);
            switch (dir) {
                case 1:
                    rc.setSection(ImageDef.sections().NPC1_WALKING_NORTH);
                    break;
                case 2:
                    rc.setSection(ImageDef.sections().NPC1_WALKING_WEST);
                    break;
                case 3:
                    rc.setSection(ImageDef.sections().NPC1_WALKING_SOUTH);
                    break;
                case 4:
                    rc.setSection(ImageDef.sections().NPC1_WALKING_EAST);
                    break;

            }
        } else {
            //same dir. continue going thru slides
            rc.setSlide(playerAnimCounter.get() / 8);
        }
        prevDir = dir;
    }
    let gotoIdle = function () {

    }

}

function playerKeyCallback(kd, kj) {
    // if (typeof currEntityState.keyCallback === "function") {
    //     currEntityState.keyCallback(keysDown, keysJust);
    // }
    let w = kd.has(KeyCode.W);
    let a = kd.has(KeyCode.A);
    let s = kd.has(KeyCode.S);
    let d = kd.has(KeyCode.D);

    player_speed = player_maxSpeed;
    if (w && a && s && d) { console.log('all'); player_speed = 0; }
    if (w && a) { player_direction = 5 * pi / 4; }
    else if (w && d) { player_direction = 7 * pi / 4; }
    else if (s && a) { player_direction = 3 * pi / 4; }
    else if (s && d) { player_direction = pi / 4; }
    else if (w && s || a && d) { player_speed = 0; }
    else if (w) { player_direction = 3 * pi / 2; }
    else if (a) { player_direction = pi; }
    else if (s) {
        player_direction = pi / 2;
    }
    else if (d) { player_direction = 2 * pi; }
    else { player_speed = 0; } //didnt move


    if (kj.has(KeyCode.E)) {
        //shootBullet();
    }
}

function shootBullet() {
    //shoot test
    let count = Counter.createAndStart();
    let bul = Engine.GameEntity.createEntity();
    let pc = Engine.PhysicsComponent.create(bul)
        .setControlFunc(() => {
            return { dx: 0.5 };
        })
        .setRectangleHitbox(Engine.PhysicsComponent.get(eID).getAABBX(), Engine.PhysicsComponent.get(eID).getAABBY(), 5, 5);
    Engine.RenderComponent.create(bul)
        .linkPosToPhysics(pc)
        .setSection(ImageDef.sections().BLUE_ORB);
    //.setGetSection(() => { return ImageDef.sections().BLUE_ORB });






    // let bul = Engine.Entity.createEntity(getEntityX(), getEntityY())
    //     .withPhysicsComponent(Engine.Entity.PhysicsComponent.newOptions()
    //         .addRectHitbox(100, 0, 5, 5, 1)
    //         .addRectHitbox(100, 10, 5, 5, 1)
    //         .setControlFunc(ctrl => {
    //             ctrl.setDX(1);
    //         })
    //         //.setOnCollideFunc((otherIndex, data) => { bul.queueDelayedRemove() })
    //     )
    //     .withRenderComponent(Engine.Entity.RenderComponent.createRenderComponent()
    //         //.setContext2D(CanvasManager.Context.main)
    //         .setCamera(mainCamera)
    //         .setImageSection(ImageDef.sections().BLUE_ORB)
    //     )
    //     .withBehavior(
    //         () => {
    //             if (count.get() === bulletLifetime) {
    //                 //console.log("REMOVE");
    //                 bul.queueDelayedRemove();
    //             }
    //         }
    //     )
}

//Handle input.
function playerKeyCallbackOldz(keysDown, keysJust) {
    if (keysDown.has(KeyCode.E)) {
        shootBullet();
    }

    //this may be too redundant and wasteful of cpu cycles, even at the cost of "encapsulation" of the keysDown which may not even be needed...
    up = keysDown.has(KeyCode.W);
    left = keysDown.has(KeyCode.A);
    down = keysDown.has(KeyCode.S);
    right = keysDown.has(KeyCode.D);


    // if (keysJust.has(KeyCode.S)) {
    //     //JUST PRESSED S!
    //     //anim walk south
    //     //TODO this needs to be based on the resultant direciton of the player not the keys.
    //     MovementAnimState.curr = MovementAnimState.SOUTH;
    //     animCounter.lap();
    // } else if (keysJust.has(KeyCode.A)) {
    //     MovementAnimState.curr = MovementAnimState.WEST;
    //     animCounter.lap();
    // } else if (keysJust.has(KeyCode.W)) {
    //     MovementAnimState.curr = MovementAnimState.NORTH;
    //     animCounter.lap();
    // } else if (keysJust.has(KeyCode.D)) {
    //     MovementAnimState.curr = MovementAnimState.EAST;
    //     animCounter.lap();
    // }


    // player_speed = maxSpeed;
    // if (w && a && s && d) { console.log('all'); player_speed = 0; }
    // if (w && a) { player_direction = 5 * pi / 4; }
    // else if (w && d) { player_direction = 7 * pi / 4; }
    // else if (s && a) { player_direction = 3 * pi / 4; }
    // else if (s && d) { player_direction = pi / 4; }
    // else if (w && s || a && d) { player_speed = 0; }
    // else if (w) { player_direction = 3 * pi / 2; }
    // else if (a) { player_direction = pi; }
    // else if (s) {
    //     player_direction = pi / 2;
    // }
    // else if (d) { player_direction = 2 * pi; }
    // else { player_speed = 0; } //didnt move

    // if (player_speed === 0) {
    //     fsm.setState();
    //     //MovementAnimState.curr = MovementAnimState.STILL;
    //     //animCounter.reset();
    //     //spaghetii! Delicious!

    // }




    // //handling movement state: (but the animcounter is handled in the keyJust handling rip) ???????????
    // switch (MovementAnimState.curr) {
    //     case MovementAnimState.STILL:
    //         entity.renderComponent.setImageSection(ImageDef.sections().NPC1);
    //         break;
    //     case MovementAnimState.SOUTH:
    //         entity.renderComponent.setImageSection(ImageDef.sections().NPC1_WALKING_SOUTH, animCounter.get() / animWalkDelay);
    //         break;
    //     case MovementAnimState.EAST:
    //         entity.renderComponent.setImageSection(ImageDef.sections().NPC1_WALKING_EAST, animCounter.get() / animWalkDelay);
    //         break;
    //     case MovementAnimState.WEST:
    //         entity.renderComponent.setImageSection(ImageDef.sections().NPC1_WALKING_WEST, animCounter.get() / animWalkDelay);
    //         break;
    //     case MovementAnimState.NORTH:
    //         entity.renderComponent.setImageSection(ImageDef.sections().NPC1_WALKING_NORTH, animCounter.get() / animWalkDelay);
    //         break;

    // }
}

function playerMouseCallback(mousePos, mouseButtonsDown, just) {
    if (just.size > 0) {
        console.log(mousePos);
        //console.log(mouseButtonsDown);
    }
}

function getEntityID() {
    return eID;
}

/**
 * Player GameEntity must have been initialized.
 * This is an unoptimized function that immediately sets the player's AABB to the world coordinates specified.
 * Typically this is only called at the beginning when the map loads
 * @param {*} x 
 * @param {*} y 
 */
function setLocation(x, y) {
    Engine.PhysicsComponent.get(eID)
        ._hitbox._xMin = x;
    Engine.PhysicsComponent.get(eID)
        ._hitbox._yMin = y;
}
// function getEntityX() {
//     return entity.getX();
// }
// function getEntityY() {
//     return entity.getY();
// }

export { init, getEntityID, setLocation };