//use ma engine
import * as Engine from "../engine/engine.js";

import * as MainState from "./gamestate/mainstate.js";
import * as FirstLoadState from "./gamestate/firstloadstate.js";
import * as LoadWorldState from "./gamestate/loadworldstate.js";

import * as MyAssetLoader from "./myassetloader.js";

import * as MySettings from "./mysettings.js";



//let mousedowntest = false;
//Canvas.main.addEventListener("mousedown", function () { mousedowntest = true });
//window.setTimeout(function () { mousedowntest = true; }, 1000);



function addMyGameState(id, myGameState, name, cuu = true) {
    Engine.Startup.createGameState(id)
        .setUpdate(myGameState.update)
        .setRender(myGameState.render)
        .setOnExit(myGameState.onExit)
        .setOnEnter(myGameState.onEnter)
        .setCatchUpUpdates(cuu)
        .setName(name);
}

//TODO gamestate's name needs to be better coupled with ID, or just have name.
addMyGameState(MySettings.GameStateID.Main, MainState, "main", false);
addMyGameState(MySettings.GameStateID.FirstLoad, FirstLoadState, "firstload", false);
addMyGameState(MySettings.GameStateID.LoadWorld, LoadWorldState, "loadworld", false);



//Engine.Startup.setAssetPaths(assetsArr);
//Engine.Startup.setStartingState(GameStateID.Main);
Engine.Startup.setStartingState(MySettings.GameStateID.FirstLoad);



Engine.start();