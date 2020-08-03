// Unneeded - integrated in RenderComponent




//import Engine from "../engine.js";
// //an "add-on" to RenderComponent
// //whose idk field can either contain ImageSections or Animation2Ds.
// //Animation2D object represents a 2D "flip-book" animation where every x frames (1/60th of sec) the next image or "slide" of the animation is rendered

// function Animation2D (imageStrip) {
//     this.imageStrip = imageStrip;
//     this.delay = 15;
//     this.slideCounter = 0;
//     this.frameCounter = 0;

// }
// Animation2D.prototype.setImageStrip = function(imageStrip) {
//     this.imageStrip = imageStrip;
//     return this;
// }
// Animation2D.prototype.setDelay = function(delay) {
//     this.delay = delay;
//     return this;
// }
// /**
//  * Leave blank for indefinite pause (until resume)
//  */
// Animation2D.prototype.pauseFor = function(time) {
//     this.delay = delay;
// }
// Animation2D.prototype.resume = function(delay) {
//     this.delay = delay;
// }

// function create(imageStrip) {
//     return new Animation2D(imageStrip);
// }

// export {create}