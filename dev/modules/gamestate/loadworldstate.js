import * as Engine from "../../engine/engine.js";
import * as CM from "../canvas-manager.js"
import * as Player from "../entity/player.js";
import * as MySettings from "../mysettings.js";
import * as MyAssetLoader from "../myassetloader.js";

import * as TilemapData from "../tilemap-data.js";

import * as ImageDef from "../imagedef.js";

//TODO
//some tilemaps may be too large to load all at once.
//this state will load it async'ly then draw the progress. (dunno if this is possible because it'll load the entire doc at once.)
//this is to prevent completely freezing the page.

//from the Tiled map editor

/**
 * data sent to MainState for it to read and create entities from. Read-only from outside
 */
var objects_to_send = new Set();
/**
 * the id of the node for MainState to set the player to
 */
var nodeDefer = 0;

// TODO any previously loaded maps can be "cached" here as key-value pair of map name and map data.
var loadedMaps = new Map();

/**
 * 
 * @param {*} urlToJSON 
 * @param {*} callback the XHTTP object is passed into callback.
 */
function ajaxJSON(urlToJSON, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("DONE LOADING: " + urlToJSON);
            callback(this);
        }
    };
    xhttp.open("GET", urlToJSON, true); //async
    xhttp.send();
}
var levelDataArray; //from tiled. 1d array of ints rep the world
var mapTWidth;
var mapTHeight;

function onEnter(from, data) {
    console.log("Entered loadworldstate: " + Date.now());

    //if from firstload or menu, then it's the very first loadworld, so init player and stuff.
    let map = null;
    //let nodeToGoTo = null;
    if (from.name === "firstload") {
        //this is the very first map
        map = "ahh.json";
        nodeDefer = 123456; //dummy value only for first load in order to put it at a [TEMPORARY] player first spawn point?
    }
    
    else if (from.name === "main" && data.json) {
        //clear the list of objects, since it's from the previous time loadworldstate was invoked
        objects_to_send.clear();

        //check if the incoming state is the main state (in-game)
        //if it is, load whatever map it is pointing to.
        map = data.json;
        //nodeToGoTo = data.node;
        
        //DEFER the node that was sent here to the NEXT main state,
        //since that main state's onenter is what actually sets the player's position so it needs the node.
        nodeDefer = data.node;
    }

    //TODO check if loaded into mem already.


    //Load the json map into memory

    ajaxJSON("./assets/leveldata/" + map,
        xhttp => {

            console.log("done reading level at: " + Date.now());
            let map_data = JSON.parse(xhttp.response);
            console.log("done parsing level at: " + Date.now());

            mapTWidth = map_data.width;
            mapTHeight = map_data.height;
            //check layers.

            let initPlayerX = 0;
            let initPlayerY = 0;

            map_data.layers.forEach(layer => {
                console.log(layer.type);
                if (layer.type === "tilelayer") {
                    levelDataArray = layer.data;
                } else if (layer.type === "objectgroup") {
                    console.log(layer.objects);
                    layer.objects.forEach(object => {
                        //each object has:
                        //     "gid":,
                        //  "height":,
                        //  "id":,
                        //  "name":"",
                        //  "rotation":,
                        //  "type":"",
                        //  "visible":,
                        //  "width":,
                        //  "x":,
                        //  "y":

                        //this is definitely placeholder to find a player spawn point
                        if (object.name === "player") {
                            initPlayerX = object.x;
                            initPlayerY = object.y;
                        }


                        //add object to send to mainstate (regardless of whether mainstate will actually create an entity from it, just send all)
                        objects_to_send.add(object);

                        // if (DUMB[object.gid]) {
                        //     console.log("BRUH FOUND " + DUMB[object.gid]);

                        // }


                        //TODO can't map static solidity data with this! Objects should be SOLID! and should LINK WITH THE TILEMAP GRID!
                    });
                }

            });
            
            //physics needs terrain (set every time?)
            Engine.PhysicsComponent.setTerrainMap(
                levelDataArray,
                TilemapData.id_data,
                mapTWidth,
                16 // NOTE: hardcoded.
            );
            // Engine.PhysicsComponent.setTerrainMapBounds(
            //     mapTWidth,
            //     mapTHeight,
            //     16
            // )


            if (from.name === "main") {
                //already loaded before, so only set things that may change
                Engine.TileMapRenderer.settings()
                    .setMapArray(levelDataArray)
                    .setMapTWidth(mapTWidth)
            }
            else if (from.name === "firstload") {
                //first time ever loaded map, so initialize important things like camera

                let cam = Engine.Camera2D.createCamera2D();
                //set this camera as the default for rendercomponents
                Engine.RenderComponent.setDefaultCamera(cam);

                Engine.TileMapRenderer.settings()
                    .setCanvas(CM.Canvas.main)
                    .setCamera(cam)
                    .setMapArray(levelDataArray)
                    .setTilesetImage(MyAssetLoader.getAsset("./assets/images/tileset.png"))
                    .setTilesize(16)
                    .setMapTWidth(mapTWidth)

                //player init here instaed of mainstate.onEnter, also only init if hasn't been already 
                Player.init(cam, initPlayerX, initPlayerY);

                let playerPC = Engine.PhysicsComponent.get(Player.getEntityID());
                function playerCenter() {
                    return {
                        x: playerPC.getAABBX() + playerPC.getAABBWidth() / 2,
                        y: playerPC.getAABBY() + playerPC.getAABBHeight() / 2
                    }
                }
                //physics area needs to be centered on the player
                Engine.PhysicsComponent.setGridCenterRef(playerCenter);
            }


            Engine.State.queueState(MySettings.GameStateID.Main);

            console.log(levelDataArray);

            //white background (??? doesnt work?)
            CM.Context.bkgd.fillStyle = "white";
            CM.Context.bkgd.fillRect(0, 0, CM.Canvas.bkgd.width, CM.Canvas.bkgd.height);

        });


}
function onExit(to) {
    return {node: nodeDefer, tiled_objects: objects_to_send};
}
function update() {

}
function render() {
    CM.Context.main.clearRect(0, 0, MySettings.V_WIDTH, MySettings.V_HEIGHT);
    CM.Context.main.fillText("Loading level... ", 50, 50);
}



export { onEnter, onExit, update, render };