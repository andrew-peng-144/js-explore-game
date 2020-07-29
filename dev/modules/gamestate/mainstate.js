import * as Engine from "../../engine/engine.js";


import * as CM from "../canvas-manager.js";
import * as MySettings from "../mysettings.js";
import * as ImageDef from "../imagedef.js";
import * as KeyCode from "../misc/keycode.js";
import * as ReadMapData from "../misc/read-mapdata.js";
import * as MyAssetLoader from "../myassetloader.js";

import * as Player from "../entity/player.js";
import { settings } from "../../engine/main/tilemap-renderer.js";

import * as DrawHitbox from "../misc/draw-hitbox.js";

//"implments" state "interface"

//lul
let i = 0;
let ent = null;
let myCameraFixture;
let cam;
function onEnter(from) {
    i = 0;
    console.log("entered mainstate from " + from);
    cam = Engine.Camera2D.createCamera2D();

    ent = Engine.Entity.createEntity(30, 30)
        .withRenderComponent(CM.Context.main,
            ImageDef.issToImageSection(ImageDef.imageStringSections.LINKIN, MyAssetLoader.assets),
            cam)
        .withPhysicsComponent(Engine.Entity.newPhysicsOptions()
            .addRectHitbox(0, 0, 50, 30, true)
        );

    //create another one to test, but dont save ref
    // Engine.Entity.createEntity(50, 60)
    //     .withRenderComponent(CM.Context.main,
    //         ImageDef.issToImageSection(ImageDef.imageStringSections.NPC1, MyAssetLoader.assets),
    //         cam)
    //     .withPhysicsComponent(Engine.Entity.newPhysicsOptions()
    //         .addRectHitbox(0, 0, 30, 40, true)
    //         .addRectHitbox(5, 20, 40, 30)
    //         .setControlFunc(function (controller) {
    //             controller.setDX(0);
    //             //controller.setDY(0);
    //         })
    //         .setCollisionDataFunc(function () {
    //             return "Hey I am a NPC and I have a message for whoever I collided with: YOU SUCK";
    //         })
    //         .setOnCollideFunc(function (i, otherData) {
    //             //console.log("I am a NPC and the " + i + "th other guy says:" + otherData);
    //         })
    //     );

    //load map (costly) (synchronous for now)
    ReadMapData.read("./assets/leveldata/testing3.json");

    if (!ReadMapData.hasLoaded()) {
        throw "wut";
    }

    //setup tilemap renderer
    Engine.TileMapRenderer.settings()
        .setCanvas(CM.Canvas.main)
        .setCamera(cam)
        .setMapArray(ReadMapData.getMapArray())
        .setMapTWidth(ReadMapData.getMapWidthInTiles())
        .setTilesetImage(MyAssetLoader.getAsset("./assets/images/tileset.png"))
        .setTilesize(16);

    //player init
    Player.init(cam);


    //out-of-engine pausing ???
    //all actors will freeze, and frame counter for this gamestate will pause too
    document.addEventListener("keydown", ev => {
        if (ev.keyCode === KeyCode.P) {
            paused = true;
        }
        if (ev.keyCode === KeyCode.R) {
            paused = false;
        }
    });

}
function onExit(to) {
    console.log("exited mainstate, to " + to);
}


let paused = false;

function update() {
    if (paused) {
        return;
    }
    Engine.Entity.updateInputComponents();
    //Engine.Entity.updateKinematicComponents();
    //Engine.Entity.handleHitboxCollisions();
    Engine.Entity.updatePhysics();


    //console.log("LMFAO");
    i++;

    //center camera on player
    cam.setPosition(Player.getEntityX() - MySettings.V_WIDTH / 2 / Engine.ZOOM, Player.getEntityY() - MySettings.V_HEIGHT / 2 / Engine.ZOOM);

    // if (i === 600) {
    //     ent.remove();
    // }
}
function render() {
    CM.Context.main.clearRect(0, 0, MySettings.V_WIDTH, MySettings.V_HEIGHT);

    if (paused) {
        CM.Context.main.fillText('ENTITIES PAUSED', 10, 70);
    }
    //CM.Context.main.fillRect(50, 50 + i, 60, 60);
    Engine.TileMapRenderer.renderVisibleTiles();
    Engine.Entity.drawRenderComponents();

    //CM.Context.main.fillText('MAIN STATE', 10, 50);
    DrawHitbox.drawHitboxes(CM.Context.main, cam);
}

export { onEnter, onExit, update, render };