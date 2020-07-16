/*
You have a fixed set of states that the machine can be in.
For our example, that’s standing, jumping, ducking, and diving.

The machine can only be in one state at a time.
Our heroine can’t be jumping and standing simultaneously. In fact, preventing that is one reason we’re going to use an FSM.

A sequence of inputs or events is sent to the machine.
In our example, that’s the raw button presses and releases.

Each state has a set of transitions, each associated with an input and pointing to a state.
When an input comes in, if it matches a transition for the current state, the machine changes to the state that transition points to.














LOL PROBABLY DONT do it this way, for the main fsm at least. instead have it have multiple "classes" that the user passes in.
which have their own update, render, onenter, and onexit.

for like animation states, maybe can do it simpler like this way.

*/

//can have "static" states (no unique properties) or instantiated states

var wow;

function FSM(startingState) {
    if (typeof startingState !== "number") {
        throw "fsm initial state must be a number, preferably an integer";
    }
    this._currentState = startingState;
    this._transitions = {};
    this.currentQueuedTransitionID = null;
}

/**
 * Create a finite state machine. This does not include functions, just a representation of an fsm.
 * That will be handled outside (?)
 */
function createFSM(startingState) {
    let fsm = new FSM(startingState);

    return fsm;
}

FSM.prototype.withTransition = function (transitionID, from, to) {
    if (typeof id === "number" || typeof from === "number" || typeof to === "number") {
        this._transitions[transitionID] = { from: from, to: to };
    } else {
        throw 'illegal arg exc';
    }
    return this;
}
// FSM.prototype.startingState = function (s) {
//     if (typeof s !== "number") {
//         throw "fsm state must be a number, preferably an integer";
//     }
//     this._currentState = s;
//     return this;
// }
FSM.prototype.queueTransition = function (transitionID) {
    let t = this._transitions[transitionID];

    if (t) { //transition exists in the fsm

        if (t.from === this._currentState) { //and fsm is currently in the "from" state
            this.currentQueuedTransitionID = transitionID; //"queue" it.
        } else {
            console.log("transition isn't currently in state, ignoring it");
        }
    } else {
        throw "transition isn't in fsm"
    }
}
FSM.prototype.doQueuedTransition = function () {
    //now will actually set it to the "to" state
    this._currentState = this._transitions[this.currentQueuedTransitionID].to;

    //and un-queue it
    this.currentQueuedTransitionID = null;
}
FSM.prototype.getState = function () { return this.currentState };

export { createFSM };