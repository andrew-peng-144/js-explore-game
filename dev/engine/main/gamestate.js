import * as Engine from "../engine.js";
//update, (render,) onenter, onexit.

function GameState() {
    this.name = "noname";
    this._update = null;
    this._render = null;
    this._onEnter = null;
    this._onExit = null;

    this._catchUpUpdates = true;

}
// GameState.prototype.update = function() {

// }
// GameState.prototype.onEnter = function() {

// }
// GameState.prototype.onExit = function() {

// }

let gsArr = [];
let currentState = null;
let queuedState = null;

/**
 * use methods to set the gamestate's functinos.
 * Also DIRECTLY Sets it as the current state.
 * @throws exception if tried to make AFTEr game started
 * @param {Number} id 
 */
function createGameState(id) {
    if (typeof id !== "number") {
        throw "BRUH";
    }

    let gs = new GameState();
    gsArr[id] = gs;
    currentState = gs;
    return gs;
}

function setStartingState(id) {

    if (!gsArr[id]) {
        throw "state isn't in system";
    }
    let gs = gsArr[id];
    currentState = gs;
    return gs;
}
/**
 * Component updating must be done by the user! the engine does not call component update.
 * Call them by category using Entity.update<component>
 * @param {Function} func 
 */
GameState.prototype.setUpdate = function (func) {
    this._update = func;
    return this;
}
GameState.prototype.setRender = function (func) {
    this._render = func;
    this.clearEveryFrame = true;
    return this;
}
/**
 * Set the function to call when this state is entered (not immediate, happens at beginning of update)
 * This function will have two args passed, 1st is a ref to the previous state, 2nd is the data that the prev state passed over (what its onExit returned)
 */
GameState.prototype.setOnEnter = function (func) {
    this._onEnter = func;
    return this;
}
/**
 * Set the function to call when this state is exited from (not immediate, happens at beginnign of update)
 * The function passed in can RETURN data, which the next state can read from in their onEnter().
 * This function will have 1 arg passed, is a ref to the next state.
 */
GameState.prototype.setOnExit = function (func) {
    this._onExit = func;
    return this;
}
/**
 * Sets whether the current gamestate allows for update to be called multiple times if there's a large enough lag spike.
 * Default is true. Typically set this to false for "loading" screens.
 */
GameState.prototype.setCatchUpUpdates = function(bool) {
    if (typeof bool !== "boolean") {
        throw "BRU";
    }
    this._catchUpUpdates = bool;
    return this;
}

/**
 * Set a string to easily identify this state when logging
 */
GameState.prototype.setName = function(str) {
    this.name = str;
    return this;
}

//dunno bout dis one too, since the canvas is all handled by the user and clearing would need to know canvas bounds.
//so for now the user gonna have to clear.
// GameState.prototype.setClearEveryFrame = function(bool) {
//     if (!this._render) {
//         throw "no";
//     }
//     this.clearEveryFrame = bool;
//     return this;
// }



// dunno about this b/c u shouldnt be able to set it DURING the game only before it starts.
// let setFirstState = function(id) {
//     currentState
// }

let veryFirstStateDone = false;
/**
 * Handles a state change if one was queued. (calls enter on new, exit on old)
 * The very first game state will still have onEnter called.
 */
function handleStateChange() {
    if (!veryFirstStateDone) {
        currentState._onEnter(null);
        veryFirstStateDone = true;
    }

    let prevState;

    //data to pass from exited state to entered state
    let passingData = null;

    if (queuedState !== null) {
        //switch.
        if (currentState._onExit) {
            passingData = currentState._onExit(queuedState);
        }
        prevState = currentState;
        currentState = queuedState;
        if (currentState._onEnter) {
            currentState._onEnter(prevState, passingData);
        }
        queuedState = null;
    }
}

/**
 * Calls update on the current state. 
 */
function stepCurrentState() {
    

    if (currentState._update) {
        currentState._update();
    }
}

function renderCurrentState() {
    if (currentState._render) {
        currentState._render();
    }
}

/**
 * Returns whether the current gamestate allows for update to be called multiple times if there's a large enough lag spike.
 * 
 */
function currentStateCatchUpUpdates() {
    return currentState._catchUpUpdates;
}

/**
 * 
 * @param {Number} id id of the gamestate to queue.
 */
function queueState(id) {
    if (typeof id !== "number") {
        throw "rip";
    }
    if (typeof gsArr[id] === "undefined") {
        throw "The state you want to queue isn't in the system! add it using createGameState";
    }
    if (gsArr[id] === currentState) {
        console.log("Already in this state!");
        return;
    }
    queuedState = gsArr[id];
}

function getNumStates() {
    return gsArr.length;
}



export { createGameState, queueState, stepCurrentState, renderCurrentState,
    getNumStates, setStartingState, handleStateChange, currentStateCatchUpUpdates }