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

/**
 * Do not change this.
 * data structure holding integers of keys down.
 * This can either be read from directly, or read as a parameter in the InputComponent keylistener.
 * 
 */
var keysDown = new Set();

var keysJustDown = new Set();
let curr = 0;

/**
 * The first time this method is called it will add a keydown and keyup listener to the document.
 * Makes this gameentity respond to key events. Two Sets: keys down and keys just down, are sent as 1st and 2nd argument to the callback.
 */
InputComponent.prototype.setKeyListener = function (callback) {
    if (!initializedKeyListener) {
        document.addEventListener('keydown', function (ev) {
            // if (keysDown.includes(ev.keyCode)) {
            //     //no duplicates.
            //     return;
            // }
            //debugger;

            if (!keysDown.has(ev.keyCode)) {
                keysDown.add(ev.keyCode);
                keysJustDown.add(ev.keyCode);
            }
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
            ic.callback(keysDown, keysJustDown); //execute the callback, passing in list of keys down
        }
    });

    // //clear keysDownThisFrame at end of each frame
    // for (let i = 0; i < keysDownThisFrame.length; i++) {
    //     keysDownThisFrame[i] = 0;
    // }
    keysJustDown.clear();

}


export { createInputComponent, updateAll }