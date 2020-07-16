//component to attach to gameentity that responds to mouse or keyboard.

function InputComponent() {
    this.cases = {};
    this.callback = null;
}
var initializedKeyListener = false;
/**
 * @type {InputComponent[]}
 */
var inputComponents = [];

var keysDown = [];
let curr = 0;

/**
 * Makes this gameentity respond to key events. A List of keys down is sent as the argument to the callback. (0 isn't a key)
 */
InputComponent.prototype.setKeyListener = function (callback) {
    if (!initializedKeyListener) {
        document.addEventListener('keydown', function (ev) {
            if (keysDown.includes(ev.keyCode)) {
                //no duplicates.
                return;
            }
            keysDown.push(ev.keyCode);
        });
        document.addEventListener("keyup", function (ev) {
            let index = keysDown.indexOf(ev.keyCode);
            if (index > -1) {
                keysDown.splice(index, 1);
            }
        });
        initializedKeyListener = true;
    }

    //this.cases[keycode] = callback;
    this.callback = callback;

    //return this;
}


// InputComponent.prototype._update = function () {

// }

function createInputComponent() {
    let ic = new InputComponent();
    inputComponents.push(ic);
    return ic;
}



function updateAll() {
    inputComponents.forEach(ic => {
        keysDown.forEach(keycode => {
            if (keycode > 0) {
                ic.callback(keysDown); //execute the callback, passing in list of keys down
            }
        });
    });

    // //clear keysDownThisFrame at end of each frame
    // for (let i = 0; i < keysDownThisFrame.length; i++) {
    //     keysDownThisFrame[i] = 0;
    // }

}


export { createInputComponent, updateAll }