import { Point } from "./geom.js";

//Data that represents a shape that's a hitbox FCUK
//but theres like different kinds
//rect, poly, circle.
/**
 * 
 * @param {Number} w 
 * @param {Number} h 
 */
function Rectangle(xOff, yOff, w, h) {
    this.xOff = xOff;
    this.yOff = yOff;
    this.w = w;
    this.h = h;
}
/**
 * 
 * @param {Point[]} v 
 */
function Polygon(v) {
    this.v = v;
}
/**
 * 
 * @param {Number} r 
 */
function Circle(xOff, yOff, r) {
    this.xOff = xOff;
    this.yOff = yOff;
    this.r = r;
}

/**
 * constuct a hitbox with default parameters. use methods to set shape and other propertiez.
 */
function Hitbox() {
    this.shape = null;
    this.solid = false;
    this.type = 0;
    this.zid = 0;
}
Hitbox.create = function () {
    let w = new Hitbox();
    return w;
}

Hitbox.prototype.shapeRectangle = function (xOff, yOff, w, h) {
    this.shape = new Rectangle(xOff, yOff, w, h);
    return this;
}
/**
 * @param {Point[]} v Array of Points.
 */
Hitbox.prototype.shapePolygon = function (v) {
    this.shape = new Polygon(v);
    return this;
}
Hitbox.prototype.shapeCircle = function (xOff, yOff, r) {
    this.shape = new Circle(xOff, yOff, r);
    return this;
}
Hitbox.prototype.makeSolid = function () {
    this.solid = true;
    return this;
}
Hitbox.prototype.hasType = function (type) {
    this.type = type;
    return this;
}
Hitbox.prototype.hasInitialZid = function (zid) {
    this.zid = zid;
    return this;
}

/**
 * // TODO only rect & rect is done
 * Static method that handles whether two hitboxes collided. Does not alter anything
 * @param {Hitbox} hitbox1 
 * @param {Hitbox} hitbox2 
 */
Hitbox.isCollision = function (hitbox1, hitbox2) {
    //rect & rect:
    if (hitbox1.shape.constructor.name === "Rectangle" && hitbox2.shape.constructor.name === "Rectangle") {
        return (hitbox1.shape.x < hitbox2.shape.x + hitbox2.shape.width &&
            hitbox1.shape.x + hitbox1.shape.width > hitbox2.shape.x &&
            hitbox1.shape.y < hitbox2.shape.y + hitbox2.shape.height &&
            hitbox1.shape.height + hitbox1.shape.y > hitbox2.shape.y);
    }


    //rect & poly

    //circle & circle

    //rect & circle
}

export { Hitbox };
