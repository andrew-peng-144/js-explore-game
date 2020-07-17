//component to attach to gameentity that responds to mouse or keyboard.

function InputComponent() {
    //this.cases = {};
    this.callback = null;
}
var initializedKeyListener = false;
/**
 * @type {InputComponent[]}
 */
var inputComponents = new Set();

var keysDown = new Set();
let curr = 0;

/**
 * The first time this method is called it will add a keydown and keyup listener to the document.
 * Makes this gameentity respond to key events. A Set of keys down is sent as the argument to the callback. (0 isn't a key)
 */
InputComponent.prototype.setKeyListener = function (callback) {
    if (!initializedKeyListener) {
        document.addEventListener('keydown', function (ev) {
            // if (keysDown.includes(ev.keyCode)) {
            //     //no duplicates.
            //     return;
            // }
            //debugger;
            keysDown.add(ev.keyCode);
        });
        document.addEventListener("keyup", function (ev) {
            // let index = keysDown.indexOf(ev.keyCode);
            // if (index > -1) {
            //     keysDown.splice(index, 1);
            // }
            keysDown.delete(ev.keyCode);
        });
        initializedKeyListener = true;
    }

    //this.cases[keycode] = callback;
    this.callback = callback;

    return this;
}

InputComponent.prototype.remove = function () {
    inputComponents.delete(this);
}


// InputComponent.prototype._update = function () {

// }

function createInputComponent() {
    let ic = new InputComponent();
    inputComponents.add(ic);
    return ic;
}



function updateAll() {
    inputComponents.forEach(ic => {
        if (ic.callback) {
            ic.callback(keysDown); //execute the callback, passing in list of keys down
        }
    });

    // //clear keysDownThisFrame at end of each frame
    // for (let i = 0; i < keysDownThisFrame.length; i++) {
    //     keysDownThisFrame[i] = 0;
    // }

}


export { createInputComponent, updateAll }