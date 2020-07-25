import * as Engine from "/dev/engine/engine.js";


import * as CM from "../canvas-manager.js";
import * as MySettings from "../mysettings.js";
import * as ImageDef from "../imagedef.js";
import * as KeyCode from "../misc/keycode.js";
import * as ReadMapData from "../misc/read-mapdata.js";
import * as MyAssetLoader from "../myassetloader.js";

//"implments" state "interface"

//lul
let i = 0;
let ent = null;
let myCameraFixture;
let cam;
function onEnter(from) {
    i = 0;
    console.log("entered mainstate from " + from);

    myCameraFixture = Engine.Entity.createEntity(0, 0)
        .withInputComponent(function (keySet) {
            if (keySet.has(KeyCode.D)) {
                myCameraFixture.x++;
            }
            if (keySet.has(KeyCode.A)) {
                myCameraFixture.x--;
            }
            if (keySet.has(KeyCode.W)) {
                myCameraFixture.y--;
            }
            if (keySet.has(KeyCode.S)) {
                myCameraFixture.y++;
            }
        });
    cam = Engine.Camera2D.createCamera2D();


    ent = Engine.Entity.createEntity(30, 30)
        .withRenderComponent(CM.Context.main,
            ImageDef.issToImageSection(ImageDef.imageStringSections.LINKIN, MyAssetLoader.assets),
            cam)
        .withInputComponent(function (keySet) {
            if (keySet.has(KeyCode.W)) {
                console.log("YO");
            }
        });

    //create another one to test, but dont save ref
    Engine.Entity.createEntity(50, 60)
        .withRenderComponent(CM.Context.main,
            ImageDef.issToImageSection(ImageDef.imageStringSections.NPC1, MyAssetLoader.assets),
            cam);

    //window.setTimeout(function () { Engine.State.queueState(1); }, 1000);

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

}
function onExit(to) {
    console.log("exited mainstate, to " + to);
}
function update() {
    Engine.Entity.updateInputComponents();
    Engine.Entity.updateKinematicComponents();
    Engine.Entity.handleHitboxCollisions();


    //console.log("LMFAO");
    i++;

    cam.setPosition(myCameraFixture.x, myCameraFixture.y);

    if (i > 600) {
        ent.remove();
    }
}
function render() {
    CM.Context.main.clearRect(0, 0, MySettings.V_WIDTH, MySettings.V_HEIGHT);
    //CM.Context.main.fillRect(50, 50 + i, 60, 60);
    Engine.TileMapRenderer.renderVisibleTiles();
    Engine.Entity.drawRenderComponents();

    CM.Context.main.fillText('MAIN STATE', 10, 50);
}

export { onEnter, onExit, update, render };