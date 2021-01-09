/*
 
Holds all the UI elements as variables in thsi file.
the exported draw() will call all of its elements' respective draw() methods

It also exports each element, but only their controllers may be accessed from outside.
 */

import * as DialogueBox from "./dialogue-box.js";

import * as MySettings from "../mysettings.js";

/**
 * @type {DialogueBox.DialogueBox}
 */
var mainDialogueBox;

//All elements should have x, y, width, height, and draw.
//This will be enforced in that it will call elem's constructor.

function init() {
    mainDialogueBox = DialogueBox.createDialogueBox(MySettings.V_WIDTH / 2, 500, 580, 100);

}
let WO_font = "30px Lucida Console";
function draw(ctx) {
    ctx.save();
    
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;

    ctx.font = WO_font;
    ctx.fillStyle = "#000099";

    mainDialogueBox.draw(ctx);

    ctx.restore();
}

export {init, draw, mainDialogueBox}