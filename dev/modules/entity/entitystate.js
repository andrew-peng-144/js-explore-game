//This may undergo major revision or just deletion lmao


//Wow. Much spaghetti. This has extreme coupling with Engine's GameEntity.

//Maybe put this all into a "Actor package" so enemies can inherit these as well...
//which should have coupling with the components...? like each state has its own on
//this maybe should be incorporated in the engine.
//yes the actor package wo.

function EntityState() {
    //public rip. call it directly i guess?
    //this._update = null;
    this._onEnter = null;
    this._onExit = null;

    this.control = null;
    this.keyCallback = null;
}
// EntityState.prototype.setUpdateFunc = function (func) {
//     if (typeof func !== "function") {
//         throw "rip";
//     }
//     this._update = func;
//     return this;
// }

//temp?
EntityState.prototype.setControl = function (func) {
    this.control=func;
}
//temp?
EntityState.prototype.setKeyCallback = function(func) {
    this.keyCallback=func;
}

EntityState.prototype.setOnEnter = function (func) {
    if (typeof func !== "function") {
        throw "rip";
    }
    this._onEnter = func;
    return this;
}
EntityState.prototype.setOnExit = function (func) {
    if (typeof func !== "function") {
        throw "rip";
    }
    this._onExit = func;
    return this;
}


//no machine for now b/c states' functions handled externally
//so for now a "EntityState" is just a set of data relating to a logical state an actor can be in lmao.

// //ESM
// function EntityStateMachine() {
//     this._currentStateKey = null;
//     this._states = new Map();
// }

// /**
//  * Sets the state held by this machine to be the state identified by the given key.
//  * Immediately calls onExit on current state, and onEnter on the new state.
//  */
// EntityStateMachine.prototype.setState = function (newKey) {
//     if (typeof this._currentStateKey._onExit === "function") {
//         this._getCurrState()._onExit();
//     }
//     this._currentStateKey = newKey;

//     if (typeof this._getCurrState === "function") {
//         this._states.get(newKey)._onEnter();
//     }

//     //return this;
// }

// /**
//  * Adds a new state to the state machine. Provide a key for easy identification later or key is assumed to be 0.
//  * Also sets the current to be the new state.
//  */
// EntityStateMachine.prototype.addState = function (newState, key = 0) {
//     if (newState instanceof EntityState) {
//         this._states.set(key, newState);
//         this._currentStateKey = key;
//     } else {
//         throw "bru";
//     }
//     return this;
// }

// EntityStateMachine.prototype.updateCurr = function () {
//     if (typeof this._getCurrState()._update === "function") {
//         this._getCurrState()._update();
//     }
// }

// EntityStateMachine.prototype._getCurrState = function () {
//     return this._states.get(this._currentStateKey);
// }

function createState() {
    return new EntityState();
}
function createMachine(initialState) {
    throw "LULW";
    return new EntityStateMachine(initialState);
}

export { createState, createMachine }