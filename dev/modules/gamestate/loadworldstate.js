import * as Engine from "../../engine/engine.js";
import * as CM from "../canvas-manager.js"
import * as Player from "../entity/player.js";
import * as MySettings from "../mysettings.js";
import * as MyAssetLoader from "../myassetloader.js";

import * as TilemapData from "../tilemap-data.js";

//TODO
//some tilemaps may be too large to load all at once.
//this state will load it async'ly then draw the progress. (dunno if this is possible because it'll load the entire doc at once.)
//this is to prevent completely freezing the page.

//from the Tiled map editor


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
var levelDataArray;
var mapTWidth;
function onEnter(from) {
    console.log("Entered loadworldstate: " + Date.now());
    //Load the json doc into memory
    ajaxJSON("./assets/leveldata/wowo.json", xhttp => {
        //debugger;
        console.log("done reading level at: " + Date.now());
        let map_data = JSON.parse(xhttp.response);
        console.log("done parsing level at: " + Date.now());

        mapTWidth = map_data.width;
        //check layers.

        //something dumb to keep track of image objects
        //and TODO static solidity tiles for each image, like 4,5 for the big tree.
        //maps "gid" to a filename under "./assets/images/objects/"
        let DUMB = {
            257: "smalltree.png",
            258: "tree.png"
        }

        let initPlayerX = 0;
        let initPlayerY = 0;
        debugger;
        map_data.layers.forEach(layer => {
            console.log(layer.type);
            if (layer.type === "tilelayer") {
                levelDataArray = layer.data;
            } else if (layer.type === "objectgroup") {
                console.log(layer.objects);
                layer.objects.forEach(object => {
                    if (object.name === "player") {
                        initPlayerX = object.x;
                        initPlayerY = object.y;
                    }

                    //check gid if it matches any with DUMB then create object in world wo.
                    if (DUMB[object.gid]) {
                        console.log("BRUH FOUND " + DUMB[object.gid]);
                    }

                    //TODO can't map static solidity data with this! Objects should be SOLID! and should LINK WITH THE TILEMAP GRID!
                });
            }

        });

        let cam = Engine.Camera2D.createCamera2D();
        Engine.TileMapRenderer.settings()
            .setCanvas(CM.Canvas.main)
            .setCamera(cam)
            .setMapArray(levelDataArray)
            .setTilesetImage(MyAssetLoader.getAsset("./assets/images/tileset.png"))
            .setTilesize(16)
            .setMapTWidth(mapTWidth)

        //set this camera as the default for rendercomponents
        Engine.RenderComponent.setDefaultCamera(cam);

        //physics needs terrain
        Engine.PhysicsComponent.setTerrainMap(
            levelDataArray,
            TilemapData.id_data,
            mapTWidth,
            Engine.TileMapRenderer.settings().tilesize
        );


        //player init here instaed of mainstate.onEnter
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

        Engine.State.queueState(MySettings.GameStateID.Main);

        console.log(levelDataArray);

        //white background
        CM.Context.bkgd.fillStyle = "white";
        CM.Context.bkgd.fillRect(0, 0, CM.Canvas.bkgd.width, CM.Canvas.bkgd.height);

    });


}
function onExit(to) {

}
function update() {

}
function render() {
    CM.Context.main.clearRect(0, 0, MySettings.V_WIDTH, MySettings.V_HEIGHT);
    CM.Context.main.fillText("Loading level... ", 50, 50);
}

export { onEnter, onExit, update, render };