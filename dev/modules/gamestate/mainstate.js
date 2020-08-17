import * as Engine from "../../engine/engine.js";


import * as CM from "../canvas-manager.js";
import * as MySettings from "../mysettings.js";
import * as ImageDef from "../imagedef.js";
import * as KeyCode from "../misc/keycode.js";
import * as MyAssetLoader from "../myassetloader.js";

import * as Player from "../entity/player.js";

import * as TileMapData from "../tilemap-data.js";

//import * as DrawHitbox from "../misc/draw-hitbox.js";
import { createMachine } from "../entity/entitystate.js";

//"implments" state "interface"

//lul
let i_for_counter = 0;
let ticksPassed = 0;
let myCameraFixture;
let cam;

/**
 * json map data stores objects
 * some of these objects can be translated to GameEntities, so loadworldstate does that, and exports it for this mainstate to read.
 * @type {Set<Number>} stores entity IDs
 */
var entities_from_map = new Set();

/**
 * outgoing data for loadWorldState, returned by this onExit
 * json is the filename of the map data, located in /leveldata.
 * node is the int ID of which node to put the player at in the new world.
 */
var nextMapData = {
    json: null,
    node: 0
};

function onEnter(from, data) {
    i_for_counter = 0;
    console.log("entered mainstate from " + from.name);

    //check if from is loadworld
    //if so, create entities from objects it exported and store refs to them

    debugger;
    if (from.name === "loadworld" && data) {
        //data is {node, tile_objects}
        //tiled_objects is a list of Tiled objects created with the editor
        //so now create the entities from the objects

        data.tiled_objects.forEach(object => {
            console.log("TYPPPEE: " + object.type);



            if (object.gid > 256) {
                //the object is a tile image object.

                //create the entity's IMAGE only for now
                let id = Engine.GameEntity.createEntity();
                Engine.RenderComponent.create(id)
                    .setHTMLImage(MyAssetLoader.getAsset("./assets/images/objects/" + TileMapData.gti[object.gid]))
                    .setPosition(object.x, object.y - object.height) //tiled has coords start from bottom left so correct that

                entities_from_map.add(id);

            } else if (object.type === "InterNode") {
                console.log("BRAH");
                //create these nodes, which have collision response of setting state to loadworldstate and setting nextMap

                let id = Engine.GameEntity.createEntity();
                Engine.PhysicsComponent.create(id)
                    .setRectangleHitbox(object.x, object.y - object.height, object.width, object.height)
                    .setOnCollideFunc(otherHitbox => {
                        console.log(otherHitbox + "HIT A INTERNODE...");


                        let foundDestNode = false;
                        //for each property of the object
                        object.properties.forEach(prop => {
                            if (prop.name === "dest_map") {

                                Engine.State.queueState(MySettings.GameStateID.LoadWorld);
                                nextMapData.json = prop.value;//"fromtiled_testt.json";
                            } else if (prop.name === "dest_node") {
                                nextMapData.node = prop.value;
                                foundDestNode = true;
                            }

                        });

                        //didn't have a "dest_node" property so assume 0
                        if (!foundDestNode) {
                            nextMapData.node = 0;
                        }
                    });

                //assume the nodeID is 0. I guess this will happen for every node without an ID,
                //so the last node iterated is the location that the player ends up getting set to
                let nodeID = object.properties.find(prop => prop.name === "id");
                if (typeof nodeID !== "number") {
                    nodeID = 0;
                }
                //if the node's id (not gameentityID) is the destination node that the PREVIOUS MAINSTATE's node points to (that the player stepped on)
                // put player there
                if (nodeID === data.node) {
                    Player.setLocation(object.x + 50, object.y - object.height);
                    // TODO - offset is 50 for now, so it doesnt loop infinitely and cause seizures lmao
                }


                entities_from_map.add(id);
            } else if (object.type === "Teleport") {
                //create teleport pads that operate within this tilemap
            }
        });
    }

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

    //track mouse position
    let idkID = Engine.GameEntity.createEntity();
    Engine.InputComponent.create(idkID)
        .setMouseCallback(CM.Canvas.main, pos => { mousePos = pos });


    // for (let i = 0; i < 3; i++) {
    //     let rip = 0;
    //     rip = Engine.GameEntity.createEntity();
    //     Engine.PhysicsComponent.create(rip)
    //         .setRectangleHitbox(200 + i * 15, 200, 10, 10)
    //         .setControlFunc(() => { return { dx: 0.1, dy: 0.2 } })
    //     //.setOnCollideFunc((data) => { console.log(rip + " collided! other data: " + data); });
    //     Engine.RenderComponent.create(rip)
    //         //.setGetSection(() => { return ImageDef.sections().BLUE_ORB })
    //         .linkPosToPhysics(Engine.PhysicsComponent.get(rip));
    // }

    // let fireanim = Engine.Counter.createAndStart();

    // //fire anim test
    // let wow = Engine.GameEntity.createEntity();
    // let wow_rc = Engine.RenderComponent.create(wow)
    //     // .setGetSection(() => {
    //     //     return ImageDef.sections().FIRE;
    //     // })
    //     // .setGetSlide(() => { return fireanim.get() / 10; })
    //     .setPosition(600, 350)
    //     .setSection(ImageDef.sections().FIRE);
    // //animate it using behavior
    // Engine.Behavior.create(wow, () => {
    //     wow_rc.setSlide(fireanim.get() / 10);
    // });


}

let mousePos;

function onExit(to) {
    counterTest.reset();
    //remove all entities associated with map
    entities_from_map.forEach(id => {
        Engine.GameEntity.removeNow(id);
    });
    entities_from_map.clear();

    console.log("exited mainstate, to " + to.name);

    return nextMapData;
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

    ticksPassed++;

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
    Engine.PhysicsComponent.drawDebug(CM.Context.main, cam, MySettings.V_WIDTH, MySettings.V_HEIGHT);

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