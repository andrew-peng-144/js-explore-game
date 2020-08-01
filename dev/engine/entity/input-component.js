//component to attach to gameentity that responds to mouse or keyboard.

function InputComponent() {
    //this.cases = {};
    this.keyCallback = null;
    this.mouseCallback = null;
}


var initializedKeyListener = false;
/**
 * @type {InputComponent[]}
 */
var inputComponents = new Set();


// TODO the sets have rapid add/remove for EVERY INPUT, which will have memory fragmentation over long period of gameplay.
/**
 * Do not modify the set.
 * data structure holding integers of keys down.
 * This can either be read from directly, or read as a parameter in the InputComponent keylistener.
 * 
 */
var keysDown = new Set();

var keysJustDown = new Set();
let curr = 0;

/**
 * an object with canvas as key and boolean as value.
 * boolean represents whether that canvas has its mouse listener initialized.
 */
var initializedMouseListener = {};
var mouseButtonsDown = new Set();
var mouseButtonsJust = new Set();
var mousePosition = { x: 0, y: 0 };

/**
 * The first time this method is called it will add a keydown and keyup listener to the document.
 * Makes this gameentity respond to key events. Two Sets: keys down and keys just down, are sent as 1st and 2nd argument to the callback.
 * Callback is called every time updateAll is called
 */
InputComponent.prototype.setKeyCallback = function (func) {
    if (!initializedKeyListener) {
        document.addEventListener('keydown', function (ev) {
            // if (keysDown.includes(ev.keyCode)) {
            //     //no duplicates.
            //     return;
            // }
            //debugger;

            if (!keysDown.has(ev.keyCode)) {
                keysDown.add(ev.keyCode);
                keysJustDown.add(ev.keyCode); //need the conditional so it doesn't keep adding b/c keydown spams it (after delay)
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
    this.keyCallback = func;

    return this;
}

/**
 * similar functionality as setKeyListener except its for mouse buttons.
 * Also the callback has mouse position passed in as 1st, mouse buttons down passed in as 2nd, and mouse buttons just down as 3rd.
 */
InputComponent.prototype.setMouseCallback = function (canvas, func) {
    if (canvas.constructor.name !== "HTMLCanvasElement" || typeof func !== "function") {
        throw "rip";
    }
    if (!initializedMouseListener[canvas]) {
        canvas.addEventListener("mousedown", e => {

            mouseButtonsDown.add(e.button); //0=left, 1=mid, 2=right
            mouseButtonsJust.add(e.button)

        });
        canvas.addEventListener("mouseup", e => {
            mouseButtonsDown.delete(e.button);
        });
        canvas.addEventListener("mousemove", e => {
            //update mouse position (rel. to canvas)
            mousePosition.x = e.clientX - canvas.getBoundingClientRect().left;
            mousePosition.y = e.clientY - canvas.getBoundingClientRect().top;
        })
        initializedMouseListener[canvas] = true;
    }

    this.mouseCallback = func;

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
        if (ic.keyCallback) {
            ic.keyCallback(keysDown, keysJustDown); //execute the callback, passing in list of keys down
        }
        if (ic.mouseCallback) {
            ic.mouseCallback(mousePosition, mouseButtonsDown, mouseButtonsJust);
        }
    });


    // //clear keysDownThisFrame at end of each frame
    // for (let i = 0; i < keysDownThisFrame.length; i++) {
    //     keysDownThisFrame[i] = 0;
    // }
    keysJustDown.clear();
    mouseButtonsJust.clear();

}

function getCount() {
    return inputComponents.size;
}

export { createInputComponent, updateAll, getCount }