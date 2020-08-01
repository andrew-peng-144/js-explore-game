/*
the "engine" runs the gameloop by calling update and render methods on user-given gamestates.

USAGE:
1. import * as Engine from <here>
EVERYTHING the user needs is from this file.

2. CREATE GAME STATES/SCREENS. User implements these themselves. This includes all rendering. (update, render, onenter, onexit).
ALL of the game's code runs under these states. They will be large.

3. use Engine.Startup to set other essential things before starting loop.

4. engine.start().
call pause() if needed, and resume() ?



*/
import * as Settings from "./settings.js";
import * as InputComponent from "./entity/input-component.js";
import * as RenderComponent from "./entity/render-component.js";
//import * as KinematicComponent from "./entity/kinematic-component.js";
//import * as Hitbox from "./entity/hitbox.js";
import * as PhysicsComponent from "./entity/physics-component.js";
import * as GameEntity from "./entity/gameentity.js";
import * as Behavior from "./entity/behavior.js";
//import * as AssetLoader from "./main/assetloader.js";

import * as Camera2D from "./main/camera2D.js";

import * as GameState from "./main/gamestate.js";
import * as HTMLImageSection from "./main/htmlimage-section.js";
import * as TileMapRenderer from "./main/tilemap-renderer.js";

let documentLoaded = false;

document.addEventListener('DOMContentLoaded', function () { documentLoaded = true }, false);


//e.g. start at the menu. create button gameentities. then once u click start,
//queue the instruction that LOADS a level (the data of the tilemap into RAM), and the entities, player, etc

/**
 * Start the game loop
 */
function start() {
    if (documentLoaded) {
        //doc already loaded (likely because user wrapped their code in a document ready statement), so continue
        start2()
    } else {
        //doc hasn't loaded, wait till it has
        document.addEventListener('DOMContentLoaded', start2, false);
    }
}

//initializes stuff but only starts after document's loaded
let started;
function hasStarted() {
    return started;
}
function start2() {
    started = true;

    Startup = null; //once game starts, Startup object shouldnt be able to be used;

    // if (CanvasManager.getNumCanvases === 0) {
    //     throw "need at least one canvas added to canvasmanager. call Startup.withCanvas";
    // }

    //main fsm. flow of the game
    if (GameState.getNumStates() === 0) {
        throw "Need at least one game state. Call Startup.createGameState(id) and use .set methods to set update, onenter, onexit";
    }

    // //CHANGED - user now handles all their own assets.
    // //Directly start the loop now.

    // //lastly load assets.
    // //if this takes too long then maybe add a "AssetLoading" state in the beginning before the menu state.

    // if (Array.isArray(assetNames) && typeof assetNames[0] === "string") {

    //     AssetLoader.loadAssets(assetNames, startLoop);
    // } else {
    //     console.log("Warning: no assets")
    //     startLoop();
    // }

    startLoop();
}


var now, dt, last, step, maxSeconds;
function startLoop() {
    //now,
    dt = 0;
    last = timestamp();
    step = Settings.STEP;
    maxSeconds = 1;
    //var pub = {};
    function frame() {
        //TODO pausing, loop still runs but ignore update and render. For now, this is just "entity pausing" handled by user in their main state. Good for now
        now = timestamp();

        dt = dt + Math.min(maxSeconds, (now - last) / 1000);

        //Update logic.
        GameState.handleStateChange();
        if (GameState.currentStateCatchUpUpdates()) {
            //keep calling update to make up for lag
            while (dt > step) {
                dt = dt - step;
                GameState.stepCurrentState();
                //if step takes really long (longer than ~17ms) then next loop it will execute it many times in a row.
            }
        }
        else {
            //1-to-1 update and drawing.
            GameState.stepCurrentState();
        }

        //Graphics.
        RENDER(); //caveat: will call RENDER() at the very beginning at least once, before it even calls UPDATE()...

        last = now;
        framesElapsed++;
        requestAnimationFrame(frame); //Aims for 60fps.
    }
    function timestamp() {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }
    requestAnimationFrame(frame);
}

// function UPDATE() {
//     //debugger;

// }

function RENDER() {
    //CanvasManager.clearCanvases(); //user controls when to clear.
    GameState.renderCurrentState();
    //RenderComponent.drawAll(); //a rendercomponent has an associated canvas so the context for drawing is handled in function

}

let framesElapsed = 0;

let assetNames;
function getFramesElapsed() { return framesElapsed; }

// let withCanvas = function (canvas, id) {
//     CanvasManager.addCanvas(canvas, id);
//     //return ConfigControl;
// }
let setAssetPaths = function (arr) {

    if (arr.constructor.name !== "Array" || arr[0] && typeof arr[0] !== "string") {
        throw "aint an array of strings";
    }
    assetNames = arr;
    //return ConfigControl;
}

// unneeded cuz creategamestate is what users uses to create and it puts the state into the system anyway.
// Config.setGameStates = function(...states) {
//     states.forEach(state => {
//         if (state.constructor.name === "GameState") {
//             GameState.
//         }
//     })
// }

/**
 * A namespace that holds methods required to start the game.
 * Do not call any of these after start() is called.
 */
let Startup = {
    //withCanvas: withCanvas,
    createGameState: GameState.createGameState,
    setAssetPaths: setAssetPaths,
    setStartingState: GameState.setStartingState
}

/**
 * Namespace holding all methods related to entities.
 */
let Entity = {
    createEntity: GameEntity.createEntity,
    doQueuedRemoves: GameEntity.doQueuedRemoves,
    updateInputComponents: InputComponent.updateAll,
    //updateKinematicComponents: KinematicComponent.updateAll,
    //handleHitboxCollisions: Hitbox.checkForCollisions,
    drawRenderComponents: RenderComponent.drawAll,
    updatePhysics: PhysicsComponent.updateAll,
    updateBehavior: Behavior.updateAll,

    newPhysicsOptions: PhysicsComponent.newOptions,

    createInputComponent: InputComponent.createInputComponent, //TODO have these for the rest of the comps. cleaner.

    countPhysics: PhysicsComponent.getCount,
    countRender: RenderComponent.getCount,
    countInput: InputComponent.getCount,
    countBehavior: Behavior.getCount,
}

/**
 * Namespace holding all methods related to the GameState
 */
let State = {
    queueState: GameState.queueState,

}

let ZOOM = Settings.ZOOM;


//let createGameState = GameState.createGameState;


//let TileMapRenderer = TileMapRenderer;

export {
    start, getFramesElapsed, hasStarted,
    Startup,
    State,
    Entity,
    HTMLImageSection,
    Camera2D,
    //AssetLoader,
    TileMapRenderer,
    ZOOM
}