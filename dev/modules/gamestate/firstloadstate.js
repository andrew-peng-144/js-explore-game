import * as Engine from "/dev/engine/engine.js";
import * as MyAssetLoader from "../myassetloader.js";
import * as MySettings from "../mysettings.js";
import * as CM from "../canvas-manager.js";

//the very first state of the game
//that loads essential things for startup
//like all assets.
let str = "./assets/images/";
let assetsArr = [str + "sprites.png", str + "tileset.png", str + "props.png"];
let numAssets = assetsArr.length;
let numLoaded = 0;
function onEnter(from) {
    //first state in the game so param "from" will be null

    //start loading all assets
    let onLoad = function () {
        console.log("loaded" + numLoaded);
        numLoaded++;
    }

    MyAssetLoader.loadAssets(assetsArr, onLoad);

}
function onExit(to) {

}
function update() {
    //keep checking if all assets (images) are loaded
    //if so, goto mainstate (goto menu for production)
    if (numLoaded === numAssets) {
        //done ni
        Engine.State.queueState(MySettings.GameStateID.Main);
    }
}
function render() {
    //Loading progress bar
    //text for now

    CM.Context.main.clearRect(0, 0, MySettings.V_WIDTH, MySettings.V_HEIGHT);
    CM.Context.main.fillText(`LOADING ASSETS: ${numLoaded}/${numAssets}"`, 50, 50);

}

export { onEnter, onExit, update, render };