import * as Engine from "../../engine/engine.js";
import * as CM from "../canvas-manager.js"
import * as Player from "../entity/player.js";
import * as MySettings from "../mysettings.js";
import * as MyAssetLoader from "../myassetloader.js";

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
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("DONE LOADING: " + urlToJSON);
            callback(this);
        }
    };
    xhttp.open("GET", urlToJSON, true); //async
    xhttp.send();
}

var xhttp;
var levelDataArray;
var mapTWidth;
function onEnter(from) {
    console.log("Entered loadworldstate: " + Date.now());
    //Load the json doc into memory
    ajaxJSON("./assets/leveldata/fromtiled_testt.json", xhttp => {
        //debugger;
        console.log("done reading level at: " + Date.now());
        let obj = JSON.parse(xhttp.response);
        console.log("done parsing level at: " + Date.now());

        mapTWidth = obj.width;
        //check layers.
        obj.layers.forEach(layer => {
            console.log(layer.type);
            if (layer.type === "tilelayer") {
                levelDataArray = layer.data;
            } else if (layer.type === "objectgroup") {
                console.log(layer.objects);
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

        Engine.State.queueState(MySettings.GameStateID.Main);


        //player init here instaed of mainstate.onEnter
        Player.init(cam);


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