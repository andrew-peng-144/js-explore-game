//basic state machine wo

/**
 * 
 * @param {State[]} states 
 * @param {Number} init the index of the intial state.
 */
function StateMachine(states, init = 0) {
    this.states = states;
    this.currentStateIndex = init;
}
StateMachine.prototype.changeState = function(newStateIndex) {
    this.states[this.currentStateIndex].onexit();
    this.currentStateIndex = newStateIndex;
    this.states[this.currentStateIndex].onenter();
}
StateMachine.prototype.update = function() {
    this.states[this.currentStateIndex].update();
}
/**
 * @param {Function} onenter
 */
function State(name, onenter, update, onexit) {
    this.name = name;
    this.onenter = onenter;
    this.update = update;
    this.onexit = onexit;
}

export {StateMachine, State};