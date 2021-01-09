import * as Counter from "../misc/counter.js";

import * as DialogueBox from "./dialogue-box.js";

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
    //this._message = null;

    //idk its own counter to delay the messages and shi
    //this.counter = Counter.create();

    //to do line breaks
    // this.curr_word_len = 0;
    // this.next_space = 0;
    //this.line1_end = -1;
    //this.line2_end = -1; //todo make this more modular not hardcoded
    //this.msg_curr = 0;
}

Element.prototype.show = function () {
    this._shown = true;

    return this;
}
Element.prototype.hide = function () {
    this._shown = false;
    return this;
}

let WO_font = "30px Lucida Console";
let WO_spacing_px = 35;
let WO_max_char_line = 25;
/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
Element.prototype.draw = function (ctx) {
    //lulw
    if (this._shown) {
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}
/**
 * temp?
 * Sets the message to display as dialogue and starts displaying it from the beginning.
 * @param {string} str TODO have escape sequences to indicate new line or break or reset or player input choice?
 */
Element.prototype.setMessage = function (str) {
    this._message = str;
    //this.counter.lap();
}

//STATIC - the m

/**
 * Array to guarantee add order corresponds to rendering order? unlike Set
 * @type {Array<Element>}
 */
var elems = new Array();

/**
 * Create a blank GUI element with the CENTRAL x and y values (in canvas coords absolute), and size bounds
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

    //rounding off the dialogue box
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;

    ctx.font = WO_font;
    ctx.fillStyle = "#000099";

    elems.forEach(e => {
        e.draw(ctx);
    });


    ctx.restore();
}

/**
 * @param obj any js object
 * This method adds the fields x, y, w, h to obj, with the given bounds, defaulted to all 0.
 * @returns that same js objects with the new fields.
 */
function makeElem(obj, centerX=0, centerY=0, w=0, h=0) {
    obj.x = centerX - w / 2;
    obj.y = centerY - h / 2;
    obj.w = w;
    obj.h = h;
    return obj;
}
//export { drawAll, createElement, Element, DialogueBox };
export {makeElem}