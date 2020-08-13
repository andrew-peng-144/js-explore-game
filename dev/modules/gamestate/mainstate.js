import * as Engine from "../../engine/engine.js";


import * as CM from "../canvas-manager.js";
import * as MySettings from "../mysettings.js";
import * as ImageDef from "../imagedef.js";
import * as KeyCode from "../misc/keycode.js";
import * as MyAssetLoader from "../myassetloader.js";

import * as Player from "../entity/player.js";

//import * as DrawHitbox from "../misc/draw-hitbox.js";
import { createMachine } from "../entity/entitystate.js";

//"implments" state "interface"

//lul
let i_for_counter = 0;
let ticksPassed = 0;
let myCameraFixture;
let cam;
function onEnter(from) {
    i_for_counter = 0;
    console.log("entered mainstate from LOL NAME ISNT STORED");


    //cam = Engine.Camera2D.createCamera2D();
    cam = Engine.TileMapRenderer.getCamera();
    //i mean its just another way to get the same camera... unclean


    //out-of-engine pausing:
    //all actors will freeze, and frame counter for this gamestate will pause too
    document.addEventListener("keydown", ev => {
        if (ev.keyCode === KeyCode.P && !myPaused) {
            myPaused = true;
            CM.Context.main.fillText('STATE PAUSED (R TO RESUME)', 50, 100);
        }
        if (ev.keyCode === KeyCode.R && myPaused) {
            myPaused = false;
        }
    });

    Engine.Counter.setTimeFunction(() => ticksPassed);

    counterTest.start();

    let idkID = Engine.GameEntity.createEntity();
    Engine.InputComponent.create(idkID)
        .setMouseCallback(CM.Canvas.main, pos => { mousePos = pos });


    for (let i = 0; i < 3; i++) {
        let rip = 0;
        rip = Engine.GameEntity.createEntity();
        Engine.PhysicsComponent.create(rip)
            .setRectangleHitbox(200 + i * 15, 200, 10, 10)
            .setControlFunc(() => { return { dx: 0.1, dy: 0.2 } })
            //.setOnCollideFunc((data) => { console.log(rip + " collided! other data: " + data); });
        Engine.RenderComponent.create(rip)
            .setGetSection(() => { return ImageDef.sections().BLUE_ORB })
            .linkPosToPhysics(Engine.PhysicsComponent.get(rip));
    }
}

let mousePos;

function onExit(to) {
    console.log("exited mainstate, to " + to);
}


let myPaused = false;

let counterTest = Engine.Counter.create();

function update() {
    if (myPaused) {
        return;
    }
    Engine.GameEntity.updateAll();

    //console.log("LMFAO");


    //center camera on player
    cam.setPosition(
        Engine.PhysicsComponent.get(Player.getEntityID()).getAABBX() - MySettings.V_WIDTH / 2 / Engine.ZOOM,
        Engine.PhysicsComponent.get(Player.getEntityID()).getAABBY() - MySettings.V_HEIGHT / 2 / Engine.ZOOM
    );

    // if (i === 600) {
    //     ent.remove();
    // }i
    if (i_for_counter === 100) {
        //debugger;
        counterTest.pause();
    } else if (i_for_counter === 140) {
        counterTest.resume();
    } else if (i_for_counter === 200) {
        counterTest.pause();
    } else if (i_for_counter === 266) {
        counterTest.resume();
    } else if (i_for_counter === 300) {
        counterTest.pause();
    } else if (i_for_counter === 406) {
        counterTest.resume();
    } else if (i_for_counter === 501) {
        counterTest.pause();
    }

    ticksPassed++;
    i_for_counter++;

}
function render() {
    if (myPaused) {

        return;
    }

    CM.Context.main.clearRect(0, 0, MySettings.V_WIDTH, MySettings.V_HEIGHT);

    //CM.Context.main.fillRect(50, 50 + i, 60, 60);
    Engine.TileMapRenderer.renderVisibleTiles();
    //Engine.Entity.drawAll();
    Engine.GameEntity.drawAll();

    //CM.Context.main.fillText('MAIN STATE', 10, 50);
    //DrawHitbox.drawHitboxes(CM.Context.main, cam);
    //Engine.PhysicsComponent.drawDebug(CM.Context.main, cam, MySettings.V_WIDTH, MySettings.V_HEIGHT);

    CM.Context.main.fillText(
        `physics: ${Engine.PhysicsComponent.getCount()}
        renders: ${Engine.RenderComponent.getCount()}
        inputs: ${Engine.InputComponent.getCount()}
        behaviors: ${Engine.Behavior.getCount()}
        
        MOUSE: canvas ${JSON.stringify(mousePos)} world ${mousePos.x / Engine.ZOOM + cam.getRoundedX()},${mousePos.y / Engine.ZOOM + cam.getRoundedY()}
        
        `, 10, 70);

    CM.Context.main.fillText(`
        Frames skipped: ${Engine.getFramesSkipped()}
    `, 10, 50)
}

export { onEnter, onExit, update, render };