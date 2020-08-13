//A counter that counts up in integers.

import * as Engine from "../engine.js";

function Counter() {
    this.startTime = 0; //when this started
    this.pauseBegin = 0; //when this was most recently paused
    this.timePaused = 0; //the cumulative amount of time spent in the paused state (but reset when counter is reset)

    this._state = 0;
    //0: completely reset/not started/"dead"
    //1: running
    //2: paused
}
Counter.prototype.start = function () {
    if (!this.isDead()) {
        throw "Counter has already started!";
    }
    this.startTime = NOW();
    this._state = 1;
}
Counter.prototype.pause = function () {
    if (this.isDead()) {
        throw "Cannot pause a counter that hasn't started!";
    }
    if (this.isPaused()) {
        //spam protect
        console.log("Counter already paused!");
        return;
    }
    this._state = 2;
    this.pauseBegin = NOW();

}
Counter.prototype.resume = function () {
    if (this.isDead()) {
        throw "Cannot resume a counter that hasn't started!";
    }
    else if (this.isRunning()) {
        //spam protect
        console.log("Counter already resumed/running!");
        return;
    }

    this.timePaused += NOW() - this.pauseBegin;
    this._state = 1;

}
/**
 * Get the amount of time that passed from when this counter was Started.
 */
Counter.prototype.get = function () {
    if (this.isDead()) {
        return 0;
    } else if (this.isPaused()) {
        return this.pauseBegin - this.startTime - this.timePaused;
    }

    return NOW() - this.startTime - this.timePaused;
}
Counter.prototype.reset = function () {
    this._state = 0;
    this.timePaused = 0;
}
/**
 * Reset the timer, records the time passed. and then start it back up.
 * Returns the time passed.
 */
Counter.prototype.lap = function () {
    let lapTime = this.get();
    this.reset();
    this.start();
    return lapTime;

}


Counter.prototype.isPaused = function() {
    return this._state === 2;
}
Counter.prototype.isRunning = function() {
    return this._state === 1;
}
Counter.prototype.isDead = function() {
    return this._state === 0;
}

let NOW = function() {return 0;};

/**
 * Do this before creating any counters or else counters will all be stuck at 0!
 * This sets the function which returns the current "Time". This can be in any unit, as long as the return value goes up over time.
 */
function setTimeFunction(func) {
    if (typeof func !== "function") {
        throw "boo";
    }
    NOW = func;
}

function create() {
    if (!NOW) {
        throw "Must set the Time Function before creating any counters!";
    }
    return new Counter();
}
function createAndStart() {
    let c = create();
    c.start();
    return c;
}

export { create, createAndStart, setTimeFunction };