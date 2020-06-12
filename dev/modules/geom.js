function Point(x, y) {
    this.x=x;
    this.y=y;
}
function Vec2(x, y) {
    this.x=x;
    this.y=y;
}
Vec2.prototype.mag = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};
// this.addTo = function (otherVec2) {
//   return new Vec2(this.x + otherVec2.x, this.y + otherVec2.y);
// } doesnt work HELP
Vec2.prototype.getAngle = function () {
    return Math.atan2(this.y, this.x);
}
export {Point, Vec2};