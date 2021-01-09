//test code
/*
setMessage(): set a single message for the box to display. One message can only be set at a time.
show(): shows the box. hide() hides it, characters still get drawn tho. Simple boolean flag.
start_char()/draw(): starts drawing the characters. outlined by the rule in the github issue. But since we're only using 1 canvas, we just do it Pokemon gen 3 style.
pause_char(): pauses drawing new characters, keeps old characters (pointless.)



how to set message: input a string, (the entire message to be displayed. Only one can be at a time.)
Essentially this is hardcoding a virtual text renderer, SIMPLE, small, and fast.
Escape sequences:
- @n: goto next line
- @p: place a pointer here, meaning the text will stop here and only will continue if user inputs the advance key (E, or click, ...)


Internally:
- 1 line of text correseponds to 1 fillText call. Not each character.
- Since the text is delayed, achieve this using substring.
- Some pointer needs to check word-by-word in order to know whether the next word will overflow the line.

USE MONOSPACE??? FOR NOW! EASIER!

*/

import * as Counter from "../misc/counter.js";

import * as Elem from "./elem.js";


//constructor
//Subclass of Element
function DialogueBox(cx, cy, w, h) {
    //Elem.Element.call(this, x, y, w, h)
    Elem.makeElem(this, cx, cy, w, h);

    //not doing below
    //Screw inheritance. Do "add-ons".
    //Dialogue box will be an optional member of an elem.


    //or we will duck type an elem. As long as it has x,y,width,height,_shown, then draw, show, hide, can be applied to it.?
    //so the controls are like: Elem.draw(el), where "el" is a object with x,y,width,height,shown. And optionally if it has its own draw method then Elem.draw() calls that.
    //so draw is the only method that can act like this, where calling Elem.draw() also calls it.

    //or since each elem has its own controller.

    /**
     * LIST. each entry is a string, corresponding to each line, starting from the top.
     * 
     * This is needed because ctx.drawString can only draw one line at a time.
     * @type {string[]}
     */
    this._lines = [];

    this._counter = Counter.create();
    // var curr_line = 0; //index of current line drawing 
    // var curr_line_char_i = 0; //in the curr_line, index of which character drawing

    this._delay = 2; //every n frames, draw next char

    this._font_size = 30; //pixels
    this._margin_top = 20; //how much to offset drawing text, after already translating it down font_size number of pixels,
    //or else 0 would mean it is off the element because it draws with the x,y being the bottom left corner of text.
    this._margin_left = 20;
    this._line_spacing = 40; //num pixels difference between the corner of each line

    this._line_width = 30; //only monospace font for now otherwise weird.

    this._n_rows_display = 2; //max num of rows that can be displayed at once.
    this._curr_row_display = 0; //index of the top row that's being displayed
}

/**
* @param {String} msg a message of any length
* Sets the lines array, where each entry corresponds to a line to display.
* assumes the text-related states of this dialogue box are exactly the same as when it will be drawn.
*/
DialogueBox.prototype.setMessage = function(msg) {
    if (!msg || msg === "") {
        throw "Cannot set empty message";
    }
    this._lines = []; //clear array

    let message_words = msg.split(" "); //words aka TOKENS
    //let num_rows = 3; //need DISPLAYED rows. and num rows passed in can be of any length. It'll just only display n at a time.
    //let line_width = 20;

    //let lines = new Array(); //ALL the lines. Not just the displayed ones.

    let msg_words_index = 0; //index of current word to add

    for (let i = 0; msg_words_index < message_words.length; i++) {
        //for each line. Until out of words.
        
        //////accounting for escape sequence special case, skip this row if it has already been set to empty.
        if (this._lines[i] === "") {
            continue;
        }

        this._lines[i] = "";
        let remaining = this._line_width; //# of character spaces remaining on this line
        //console.log("help");

        while (true) { //keeps adding words until the word to add exceeds the remaining characters allowed, per line. Or out of words.
            //for each word:

            if (msg_words_index >= message_words.length) {
                //no more words left
                break;
            }

            let word = message_words[msg_words_index]; //current word to consider adding.

            //Special case: escape sequences
            // TODO escape sequences, such as next line, or formatting. or cue.
            // escape @a, if is a separate token, means cut off the text here by making the remaining lines blank, and that the player must advance to read the next part of text.
            if (word === "@a") {
                //stop adding words by advancing to next line
                //also make the next lines blank by calculating which row the @a is in visually. Then setting the rows below it with empty string
                let rowVisual = i % this._n_rows_display; //0-indexed
                let numRowsToSetBlank = this._n_rows_display - rowVisual - 1;
                for (let j = i + 1; j < i + 1 + numRowsToSetBlank; j++) {
                    //set rows beneath it with empty string
                    this._lines[j] = "";
                }
                //i = i + this._n_rows_display - (rowVisual + 0); //skip those empty lines, but remain on the last line b/c for loop has i++ already
                msg_words_index++; //next word.
                break;
            }

            //////Special case: VERY LONG WORDS: /////////
            //if the first word of this line is even longer than the line itself, then just make the whole line the word anyway, to prevent infinite looping for such words
            if (remaining == this._line_width && word.length > remaining) {
                this._lines[i] = word;
                msg_words_index++; //next word.
                break; //next line
            }

            //normal cases:
            if (word.length <= remaining) { //enough room to add word.
                this._lines[i] = this._lines[i].concat(word + " "); //concat word and trailing space to the line.
                remaining -= word.length + 1; //The + 1 is for the space character.
                msg_words_index++; //next word.


            } else {
                // not enough room for word
                break; //next line.
            }
        } //end while true (for each word)

        this._lines[i] = this._lines[i].trim(); //Remove the end space for this line.
        

        //lines[i] = message.substring(i * line_width, i * line_width + line_width)
    }

    //lines[num_rows - 1] = message.substring(message.length - (message.length - line_width) ); //the last (msg_len - line_width) characters.

    //return lines;
}

// DialogueBox.prototype.show = function() {

// }

DialogueBox.prototype.show = function() {
    this.shown = true;
}
DialogueBox.prototype.hide = function() {
    this.shown = false;
}

/**
 * Draws the strings directly from this._lines that were set by setMessage, and draws the characters with delay.
 */
DialogueBox.prototype.draw = function(ctx) {
    if (!this.shown) {
        return;
    }

    ctx.strokeRect(this.x,this.y,this.w,this.h);

    //Element.prototype.draw(ctx);

    //for each line. (row)

    //draw entirety of each line up to the line whose character is the timer on. Substring that line.

    //need to input an index, and return which line. // TODO. only DISPLAY n rows at a time. Control will advance to the next n rows, etc.
    let time = Math.floor(this._counter.get() / this._delay);

    //use curr_line and curr_l_c_i to cache the current position. Because it only increments by 1 character as the time incremenets by 1.
    // if (curr_line_char_i >= lines[curr_line].length) {
    //     curr_line++; //next line.
    // }

    //convert a time value into the last index.

    let prev_line_lengths = 0; //tracks the lengths of the previous lines, to substring the last line properly
    //debugger;
    
    //for each line to display
    for (let i = 0; i < this._n_rows_display; i++) {
        if (i + this._curr_row_display > this._lines.length - 1) { //note that c_r_d is 0-indexed, so we use - 1 to correct
            console.log("out of rows (normal behavior if length is not a multiple of n_rows_display)");
            break;
        }
        let line = this._lines[i + this._curr_row_display];

        if (line === "") {
            continue; //skip a blank line
        }
        if (time - prev_line_lengths > line.length) {
            //draw entire line
            ctx.fillText(line,
                this.x + this._margin_left, this.y + this._font_size + this._margin_top + this._line_spacing * i);

            prev_line_lengths += line.length;

        } else {
            //draw partial line. (this also accounts for the whole line and nothing else)
            ctx.fillText(line.substring(0, time - prev_line_lengths),
                this.x + this._margin_left, this.y + this._font_size + this._margin_top + this._line_spacing * i);

            break; //b/c this is the last line to draw.
        }
        //unfortinately a O(n) call per frame, can probably O(1) with variables
        //...but it shouldn't matter much because there's only gonna be one of these on screen

    }

    // let curr_size = 0; //
    // //for each word
    // for (let word of message_words) {

    // }
    // for (let i = 0; i < n_rows_display; i++) {

    // }

    // this.msg_curr = Math.floor(this.counter.get() / 1);

    // //VERY JANK RN - MANUALLY TRACKS 2 LINES. NEED TO MAKE IT MORE MODULAR FOR N LINES.

    // //at the beginning of line, find the index that should be the end of this current line
    // if (this.msg_curr === 0) {
    //     //start of line
    //     let foundSpace = false;
    //     for (let i = WO_max_char_line - 1; i >= 0; i--) {
    //         //start at end of line, iterate back until space, that + 1 is start of next line (still draw the space on curr line)

    //         if (this._message.charAt(i) === " ") {
    //             this.line1_end = i;
    //             foundSpace = true;
    //             //line1 end is the index of space, unless space is not found then the line1 end is the maxchar - 1.
    //             break;
    //         }
    //     }
    //     if (foundSpace === false) {
    //         this.line1_end = WO_max_char_line - 1;
    //     }
    // }
    // //repetitive code change later 
    // if (this.msg_curr === this.line1_end + 1) {
    //     //start of line
    //     for (let i = WO_max_char_line - 1 + this.line1_end + 1; i >= this.line1_end + 1; i--) {
    //         //start at end of line, iterate back until space, that + 1 is start of next line (still draw the space on curr line)
    //         if (this._message.charAt(i) === " ") {
    //             this.line2_end = i; // index of space
    //             break;
    //         }
    //     }
    // }


    // // let curr_disp_msg = this._message.substring(
    // //     0, Math.min(this.counter.get() / 1, this._message.length)
    // // );

    // //top line
    // ctx.fillText(this._message.substring(0, Math.min(this.msg_curr, this.line1_end + 1)),
    //     this.x + 20, this.y + 40
    // ); //jank/wasteful  (frequent substring calls) make bette rlater?

    // if (this.msg_curr > this.line1_end) {
    //     //second line
    //     ctx.fillText(this._message.substring(this.line1_end + 1, Math.min(this.msg_curr, this.line2_end)),
    //         this.x + 20, this.y + 40 + WO_spacing_px
    //     );
    // }

}

/**
 * clear the text and start drawing the next n rows. (n = n_rows_display)
 * 
 * If theres no more rows then returns false instead
 */
DialogueBox.prototype.advance = function() {
    this._curr_row_display += this._n_rows_display;
    this._counter.lap();

    if (this._curr_row_display >= this._lines.length) {
        this._curr_row_display = 0;
        console.log("cant advance, resetting");
        return false;
    }
}

DialogueBox.prototype.start = function() {
    this._counter.start();
}

/**
 * Probably only ever need to create this once.
 * 
 * @param {*} centerX 
 * @param {*} centerY 
 * @param {*} w 
 * @param {*} h 
 */
function createDialogueBox(centerX, centerY, w, h) {
    return new DialogueBox(centerX, centerY, w, h);

}
export {createDialogueBox, DialogueBox}