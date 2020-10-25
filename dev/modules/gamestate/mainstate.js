import * as Engine from "../../engine/engine.js";


import * as CM from "../canvas-manager.js";
import * as MySettings from "../mysettings.js";
import * as ImageDef from "../imagedef.js";
import * as KeyCode from "../misc/keycode.js";
import * as MyAssetLoader from "../myassetloader.js";

import * as Player from "../entity/player.js";

import * as TileMapData from "../tilemap-data.js";

import * as Element from "../gui/elem.js";

//import * as DrawHitbox from "../misc/draw-hitbox.js";
import { createMachine } from "../entity/entitystate.js";

import * as Counter from "../misc/counter.js";

import * as Mob from "../entity/mob.js";

import * as TiledObject from "../entity/TiledObject.js";

import * as HandlerDef from "../entity/handlerdef.js";

//"implments" state "interface"

//lul
let i_for_counter = 0;
let ticksPassed = 0;
let myCameraFixture;
let cam;

/**
 * json map data stores objects
 * 
 * some of these objects can be translated to GameEntities, so loadworldstate does that, and exports it for this mainstate to read.
 * 
 * The IDs stored here do not update realtime when one of its entities gets removed before mainstate is exited.
 * It only gets cleared when exited
 * @type {Set<Number>} stores entity IDs
 */
var entities_from_map = new Set();

/**
 * outgoing data for loadWorldState, returned by this onExit
 * json is the filename of the map data, located in /leveldata.
 * node is the int ID of which node to put the player at in the new world.
 */
var outgoing_nextMapData = {
    json: null,
    node: 0
};
let firstEntered = true;


//gui instances
let gui_bot_text = null;

/**
 * 
 * @param {*} from 
 * @param {*} data incoming data returned from previous state's onExit
 */
function onEnter(from, data) {
    i_for_counter = 0;
    console.log("entered mainstate from " + from.name);

    //initialize things one-time if first time
    if (firstEntered) {
        firstenter();
        firstEntered = false;
    }


    //check if from is loadworld
    //if so, create entities from objects it exported and store refs to them

    debugger;
    if (from.name === "loadworld" && data) {
        //data is {node, tile_objects}
        //tiled_objects is a list of Tiled objects created with the editor
        //so now create the entities from the objects
        data.tiled_objects.forEach(object => {
            console.log("TYPPPEE: " + object.type);
            //object.type refers to the verbatim type of the current object, on the Tiled map (in the json file)

            if (object.gid > 256) {
                //the object is a tile image object.
                //since its just an image its not significant enough to have its own type? (yet?)
                //create the entity's IMAGE only for now
                let id = Engine.GameEntity.createEntity();
                Engine.RenderComponent.create(id)
                    .setHTMLImage(MyAssetLoader.getAsset("./assets/images/objects/" + TileMapData.gti[object.gid]))
                    .setPosition(object.x, object.y - object.height) //tiled has coords start from bottom left so correct that

                entities_from_map.add(id);

            } else if (object.type === "InterNode") {
                console.log("BRAH");
                //create these nodes, which have collision response of setting state to loadworldstate and setting nextMap


                // TODO convert the below essential node warp thing to the new collisoin system... somehow
                //ideas: set the data to be the properties of the node object on the map.

                //set data
                let internode = new TiledObject.InterNode(); //default values.
                debugger;
                //this reads the "properties" arr from the object from the json file. how it's outlined, each entry in "properties" has name, type, and value,
                //what we want is the value.
                let destNodeProperty = object.properties.find(prop => prop.name === "dest_node");
                if (destNodeProperty) {
                    internode.dest_node = destNodeProperty.value;
                }
                let destMapProperty = object.properties.find(prop => prop.name === "dest_map");
                if (destMapProperty) {
                    internode.dest_map = destMapProperty.value;
                }
                let nodeIDProperty = object.properties.find(prop => prop.name === "id");
                if (nodeIDProperty) {
                    internode.nodeID = nodeIDProperty.value;
                }

                let internode_eid = Engine.GameEntity.createEntity(internode);
                Engine.PhysicsComponent.create(internode_eid)
                    .setRectangleHitbox(object.x, object.y - object.height, object.width, object.height)

                // .setOnCollideFunc(otherHitbox => {
                //     console.log(otherHitbox + "HIT A INTERNODE...");


                //     let foundDestNode = false;
                //     //for each property of the object
                //     object.properties.forEach(prop => {
                //         if (prop.name === "dest_map") {

                //             Engine.State.queueState(MySettings.GameStateID.LoadWorld);
                //             nextMapData.json = prop.value;//"fromtiled_testt.json";
                //         } else if (prop.name === "dest_node") {
                //             nextMapData.node = prop.value;
                //             foundDestNode = true;
                //         }

                //     });

                //     //didn't have a "dest_node" property so assume 0
                //     if (!foundDestNode) {
                //         nextMapData.node = 0;
                //     }
                // });

                //assume the nodeID is 0. I guess this will happen for every node without an ID,
                //so the last node iterated is the location that the player ends up getting set to
                // let nodeID = object.properties.find(prop => prop.name === "id");
                // if (typeof nodeID !== "number") {
                //     nodeID = 0;
                // }


                //if this node's id (not gameentityID) happens to be the destination node that the PREVIOUS MAINSTATE's node points to (that the player stepped on)
                // put player there (offset)
                if (internode.nodeID === data.node) {
                    Player.setLocation(object.x + 50, object.y - object.height);
                    // TODO - offset is 50 for now, so it doesnt loop infinitely and cause seizures lmao
                }
                //[can't do this b/c overrides the player tile mark] otherwise put player at some default location
                // else {
                //     Player.setLocation(0, 0);
                // }

                entities_from_map.add(internode_eid);


            } else if (object.type === "Teleport") {
                //create teleport pads that operate within this tilemap
            } else if (object.type === "Tile Mark") {
                //could mark enemy position,  check name is "enemy" (for now this is very generic.)

                if (object.name === "enemy") {
                    //create mob entity and add to entities_from_map
                    let eid = Mob.create(object.x, object.y, 5);
                    entities_from_map.add(eid);
                }

                //TODO could have continuity of enemies between screens. so there'd be some data structure of currently "active" enemies
                //that persist even when going thru loading zones? idk?


            }
        });
    }

    //sigh make above clearner later?

    //create gui shit
    gui_bot_text = Element.createElement(MySettings.V_WIDTH / 2, 500, 500, 100);

    //mob test
    //Mob.create(3);


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

    // let fireanim = Counter.createAndStart();

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

function firstenter(data) {

    //THESE THINGS BELOW ARE SET ONE-TIME AT BEGINNING --
    //NO NEED TO KEEP CREATING EVERY TIME ENTERED THIS STATE (which happens every tilemap change)


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
        else if (ev.keyCode === KeyCode.R && myPaused) {
            myPaused = false;
        }

        //LULW guess this can be used for other debug stuff?
        else if (ev.keyCode === KeyCode.F) {
            //test gui toggle
            gui_bot_text.display();
        }
        else if (ev.keyCode === KeyCode.G) {
            //test gui toggle
            gui_bot_text.hide();
        }
        else if (ev.keyCode === KeyCode.H) {
            //test gui toggle
            //gui_bot_text.counter.start();
            gui_bot_text.setMessage("LULWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW");
        }
        else if (ev.ctrlKey && ev.keyCode === KeyCode.E) {
            //ctrl-e print detailed list of all entities
            Engine.GameEntity.logAllEntityData();
        }

    });

    Counter.setTimeFunction(() => ticksPassed);

    //track mouse position by creating an entity that updates it
    let idkID = Engine.GameEntity.createEntity();
    Engine.InputComponent.create(idkID)
        .setMouseCallback(CM.Canvas.main, pos => { mousePos = pos });


    //setup physics collision handling
    Engine.PhysicsComponent.newCollisionCase((eid1, eid2) => {
        console.log("yo, entity #" + eid1 + " and #" + eid2);
    }, "Player", "Object");

    HandlerDef.init();
}

let mousePos;

function onExit(to) {
    //remove all entities associated with map
    entities_from_map.forEach(id => {
        Engine.GameEntity.removeNow(id);
    });
    entities_from_map.clear();

    console.log("exited mainstate, to " + to.name);

    return outgoing_nextMapData;
}


let myPaused = false;

//////SIGNALS (non-immediate events to send to mainstate)
/**
 * QUEUE. if nonempty each code will be handled by update()
 * @type array of {number, object}
 * */
var signalz = [];
/**
 * Notify the mainstate to do something (the code), which will happen when update is called after. (non-immediate Event system)
 * @param {number} code the id of which signal to trigger
 * @param {object} data any overhead to send over, as a js object
 */
function signal(code, data) {
    signalz.push({ code: code, data: data });
}

/**
 * associates a signal code to a callback function
 * 
 * 3: player stepped on internode: map transition was triggered, so time to move to loadworldstate and send over the data.
 * 69: KEKW
 * 420: OMEGALUL
 */
const SIG_DEF = {
    /**map transition via internode, data is the InterNode's data
     * */
    3: function (data) {
        console.log("whats up");
        console.log(data);
        Engine.State.queueState(MySettings.GameStateID.LoadWorld);
        outgoing_nextMapData.json = data.dest_map;//"fromtiled_testt.json";
        outgoing_nextMapData.node = data.dest_node;
    },
    69: function (data) {

    },
    420: function (data) {

    }
}


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

    //handle global signals that were queued earlier.
    let sig;
    while (sig = signalz.shift() /* dequeue */) {
        SIG_DEF[sig.code](sig.data);
    }

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

    //GUIIIIIIII
    Element.drawAll(CM.Context.main);

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



export { onEnter, onExit, update, render, signal, SIG_DEF };