//use ma engine
import * as Engine from "/dev/engine/engine.js";

import * as MainState from "./gamestate/mainstate.js";

import * as Settings from "./settings.js";

var GameStateID = {
    Menu: 1,
    Main: 2
}

//let mousedowntest = false;
//Canvas.main.addEventListener("mousedown", function () { mousedowntest = true });
//window.setTimeout(function () { mousedowntest = true; }, 1000);

function addMyGameState(id, myGameState) {
    Engine.Startup.createGameState(id)
        .setUpdate(myGameState.update)
        .setRender(myGameState.render)
        .setOnExit(myGameState.onExit)
        .setOnEnter(myGameState.onEnter);
}

addMyGameState(GameStateID.Main, MainState);

let str = "./assets/images/";
let assetsArr = [str + "sprites.png", str + "tileset.png", str + "props.png"];
Engine.Startup.setAssetPaths(assetsArr);
Engine.Startup.setStartingState(GameStateID.Main);

Engine.start();