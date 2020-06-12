var i = {}; //public variables

var keys = new Array(256); //keys pressed in this frame.

var updateKey = function (key, pressed) {

    //ensures that the key status actually changed in order to
    //prevent the annoying key repetitions.
    if (keys[key] == pressed) {return;}
    //console.log("key "+key+" updated");
    keys[key] = pressed;
    
}
i.keyPressed = function (key) {
    return keys[key];
}

var clicks = [];
var updateClick = function (click, down) {
    clicks[click] = down;
}
i.mouseDown = function (mouse) {
    return clicks[mouse];
}

var KeyCode = {
    BACKSPACE: 8,
    TAB: 9,
    RETURN: 13,
    SHIFT: 16,
    CONTROL: 17,
    ESC: 27,
    SPACE: 32,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    INSERT: 45,
    DELETE: 46,
    ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
    A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
    TILDA: 192
};
var MouseCode = {
    LEFT: 0, MIDDLE: 1, RIGHT: 2
};

// i.update = function () {

// }

function onkey(ev, key, pressed) {
    ev.preventDefault();

    if (key == KeyCode.P) {alert("ALERT PAUSED");}

    updateKey(key, pressed);
}

var init = function() {
    for (let i = 0; i < keys.length; i++) {
        keys[i] = false;
    }
    document.addEventListener('keydown', function (ev) { return onkey(ev, ev.keyCode, true); }, false);
    document.addEventListener('keyup', function (ev) { return onkey(ev, ev.keyCode, false); }, false);
}

export {i as Input, init as InputInit, KeyCode};