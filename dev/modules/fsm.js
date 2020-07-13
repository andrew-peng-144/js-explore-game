/*
You have a fixed set of states that the machine can be in.
For our example, that’s standing, jumping, ducking, and diving.

The machine can only be in one state at a time.
Our heroine can’t be jumping and standing simultaneously. In fact, preventing that is one reason we’re going to use an FSM.

A sequence of inputs or events is sent to the machine.
In our example, that’s the raw button presses and releases.

Each state has a set of transitions, each associated with an input and pointing to a state.
When an input comes in, if it matches a transition for the current state, the machine changes to the state that transition points to.
*/

//can have "static" states (no unique properties) or instantiated states

var wow;

function FSM(initialState = 0) {
    this._currentState = initialState;
    this._transitions = {};
}

/**
 * Create a finite state machine. This does not include functions, just a representation of an fsm.
 * That will be handled outside (?)
 */
function createFSM(numStates, initialState) {
    let fsm = new FSM(numStates, initialState);

    return fsm;
}

FSM.prototype.withTransition = function(transitionID, from, to) {
    if (typeof id === "number" || typeof from === "number" || typeof to === "number") {
        this._transitions[transitionID] = {from: from, to: to};
    } else {
        throw 'illegal arg exc';
    }
}
FSM.prototype.doTransition = function(transitionID) {
    let a;
    if (a = this._transitions[transitionID]) {
        if (this._currentState === a.from) {
            this._currentState = a.to;
        }
    }
}
FSM.prototype.getState = function() {return this.currentState};

export {createFSM};