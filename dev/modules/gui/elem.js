import * as Counter from "../misc/counter.js";

//module-scope vars

// let gui_canvas = null;
// /**
//  * @type {CanvasRenderingContext2D}
//  */
// let ctx = null;

/**
 * basic level gui element
 * can be drawn anywhere on screen at any size.
 * 
 * mass numbers of gui windows are not intended. realistically keep only 5ish shown at most, 10 total?
 * 
 * // TODO does this account for zoom???? no?
 */
function Element(x, y, w, h) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = w || 0;
    this.height = h || 0;

    this._shown = false;

    //idk delayed message element
    this._message = null;

    //idk its own counter to delay the messages and shi
    this.counter = Counter.create();
}

Element.prototype.display = function () {
    this._shown = true;
    this.counter.lap();
    return this;
}
Element.prototype.hide = function () {
    this._shown = false;
    return this;
}
/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
Element.prototype.draw = function (ctx) {
    //lulw
    if (this._shown) {
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        if (this._message) {
            ctx.fillText(this._message.substring(0, Math.min(this.counter.get() / 3, this._message.length)),
                this.x + 20, this.y + 40); //jank/wasteful  (frequent substring calls) bette rlater?
        }
    }

}
/**
 * temp?
 * @param {string} str
 */
Element.prototype.setMessage = function (str) {
    this._message = str;
}

/**
 * Array to guarantee add order corresponds to rendering order? unlike Set
 * @type {Array<Element>}
 */
var elems = new Array();

/**
 * Create a blank GUI element with the central x and y values (in canvas coords absolute), and size bounds
 * @returns The GUI element object. Saving a ref to the object is the only way to access it later, for now
 */
function createElement(centerX, centerY, w, h) {
    let el = new Element(centerX - w / 2, centerY - h / 2, w, h);
    elems.push(el);
    return el;
}

// /**
//  * Sets the canvas that gui stuff will be drawn on
//  * @param {HTMLCanvasElement} canvas 
//  */
// function setCanvas(canvas) {
//     gui_canvas = canvas;
//     ctx = canvas.getContext("2d");
// }

/**
 * Draws all GUI elements. Canvas must have been set
 *  @param {CanvasRenderingContext2D} ctx 
 */
function drawAll(ctx) {
    ctx.save();


    //ctx.strokeStyle = '#38f';
    // ctx.shadowColor = '#d53';
    // ctx.shadowBlur = 20;
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;

    ctx.font = "30px Lucida Console";
    ctx.fillStyle = "#000099";

    elems.forEach(e => {
        e.draw(ctx);
    });


    ctx.restore();
}

export { drawAll, createElement };