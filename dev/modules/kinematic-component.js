//add this component to a gameentity to make it MVOE!
//meaning that the x and y of it can change over time now. thru vel and accel
var kinematicComponents = []

function KinematicComponent(entityRef) {
    this.entityRef = entityRef;
    this.dx = 0;
    this.dy = 0;
    this.ddx = 0;
    this.ddy = 0;
}
KinematicComponent.prototype.setVelX = function (x) {
    this.dx = x;
    return this;
}
KinematicComponent.prototype.setVelY = function (y) {
    this.dy = y;
    return this;
}
KinematicComponent.prototype.setVelocityRT = function (r, rad) {
    this.dx = r * Math.cos(rad);
    this.dy = r * Math.sin(rad);
    return this;
}
KinematicComponent.prototype.setAccelX = function (x) {
    this.ddx = x;
    return this;
}
KinematicComponent.prototype.setAccelY = function (y) {
    this.ddy = y;
    return this;
}

function createKinematicComponent(entityRef) {
    let kc = new KinematicComponent(entityRef);
    kinematicComponents.push(kc);
    return kc;
}
/**
 * Updates the gameentity's position based on current vel and accel
 */
KinematicComponent.prototype._update = function () {
    this.dx += this.ddx;
    this.dy += this.ddy;
    this.entityRef.x += this.dx;
    this.entityRef.y += this.dy;
}
var updateAll = function() {
    kinematicComponents.forEach(k => k._update());
}

//todo remove
KinematicComponent.remove = function(i) {
    throw "lul";
}

export { createKinematicComponent, updateAll };