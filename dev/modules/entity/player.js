import * as MyAssetLoader from "../myassetloader.js";
import * as ImageDef from "../imagedef.js";
import * as Engine from "../../engine/engine.js";
import * as KeyCode from "../misc/keycode.js";
import * as CanvasManager from "../canvas-manager.js";

import * as EntityState from "./entitystate.js";

// var MovementAnimState = {
//     curr: 0,
//     STILL: 0,
//     NORTH: 1,
//     EAST: 2,
//     SOUTH: 3,
//     WEST: 4,
// }

var animCounter = Engine.Counter.create();
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
    let pc = Engine.PhysicsComponent.create(eID)
        .setRectangleHitbox(initX, initY, playerHitboxWidth, playerHitboxHeight)
        .setControlFunc(() => {
            playerController.dx = player_speed * Math.cos(player_direction);
            playerController.dy = player_speed * Math.sin(player_direction);
            return playerController;
        })
        .setOnCollideFunc((type, data) => {

        })
        .setCollisionDataFunc(() => { return "u hit the player lmfao"; });

    let rc = Engine.RenderComponent.create(eID)
        .setCamera(camera)
        .setGetSection(() => { return ImageDef.sections().NPC1 })
        .setGetSlide(() => { return 1; })
        .linkPosToPhysics(pc, 0, -7);

    // let pc = Engine.Entity.PhysicsComponent.newOptions()
    //     .addRectHitbox(0, 0, 10, 10, 0, 1)
    //     .setCollisionDataFunc(function () { return "u hit the player lmfao"; })
    //     .setControlFunc(playerControl)
    //     .setOnCollideFunc(function (i, otherData) {
    //         //console.log("I am player and I bumped into someone's " + i + "th hitbox. Their message is: " + otherData);
    //     })
    //     ;

    // entity = Engine.Entity.createEntity(280, 300)
    //     .withInputComponent(ic)
    //     .withPhysicsComponent(pc)
    //     .withRenderComponent(rc)
    //     ;


    // //state stuff, which read/manipulate entity components
    // let idleState = EntityState.createState()
    //     .setOnEnter(() => {
    //         console.log("player is idle!");
    //         rc.setImageSection(ImageDef.sections().NPC1);
    //     })
    //     .setOnExit(() => { console.log("player stopped being idle!"); })
    //     .setControl(ctrl => {
    //         ctrl.setDX(0);
    //         ctrl.setDY(0);
    //     })
    // // .setUpdateFunc(() => {
    // //     //draw idle based on direction..

    // // });

    // let attackingState = EntityState.createState()
    //     .setOnEnter(() => {
    //         console.log("player is attacking!");
    //         rc.setImageSection(ImageDef.sections().FIRE_BLADE)
    //     })
    //     .setControl(ctrl => {

    //     });

    // let player_speed = 0;
    // let player_direction = 0;

    // let movingState = EntityState.createState()
    //     .setOnEnter(() => {

    //     })
    //     .setKeyCallback((kd, kj) => {
    //         //HALLLLLLLLP
    //         let w = kd.has(KeyCode.W);
    //         let a = kd.has(KeyCode.A);
    //         let s = kd.has(KeyCode.S);
    //         let d = kd.has(KeyCode.D);

    //         player_speed = maxSpeed;
    //         if (w && a && s && d) { console.log('all'); player_speed = 0; }
    //         if (w && a) { player_direction = 5 * pi / 4; }
    //         else if (w && d) { player_direction = 7 * pi / 4; }
    //         else if (s && a) { player_direction = 3 * pi / 4; }
    //         else if (s && d) { player_direction = pi / 4; }
    //         else if (w && s || a && d) { player_speed = 0; }
    //         else if (w) { player_direction = 3 * pi / 2; }
    //         else if (a) { player_direction = pi; }
    //         else if (s) {
    //             player_direction = pi / 2;
    //         }
    //         else if (d) { player_direction = 2 * pi; }
    //         else { player_speed = 0; } //didnt move


    //         //state changes...


    //     })
    //     .setControl(ctrl => {
    //         ctrl.setDX(player_speed * Math.cos(player_direction));
    //         ctrl.setDY(player_speed * Math.sin(player_direction));
    //     })

    // currEntityState = idleState;

    // fsm = EntityState.createMachine()
    //     .addState(idleState, fsm_idle)
    //     .addState(attackingState, fsm_attack)
    //     .addState(movingState, fsm_walk)
    //     .setState(fsm_idle);


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
        shootBullet();
    }
}

function shootBullet() {
    //shoot test
    let count = Engine.Counter.createAndStart();
    let bul = Engine.GameEntity.createEntity();
    let pc = Engine.PhysicsComponent.create(bul)
        .setControlFunc(() => {
            return { dx: 0.5 };
        })
        .setRectangleHitbox(Engine.PhysicsComponent.get(eID).getAABBX(), Engine.PhysicsComponent.get(eID).getAABBY(), 5, 5);
    Engine.RenderComponent.create(bul)
        .linkPosToPhysics(pc)
        .setGetSection(() => {return ImageDef.sections().BLUE_ORB});

        
        
        
    
    
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
// function getEntityX() {
//     return entity.getX();
// }
// function getEntityY() {
//     return entity.getY();
// }

export { init, getEntityID };