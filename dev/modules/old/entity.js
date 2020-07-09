function Entity() {
    ///...
    // Center of mass usually.
    this.position = point2();
    // Linear velocity.
    // There is also something like angular velocity, not described here.
    this.velocity = vector2();
    // Acceleration could also be named `force`, like in the Box2D engine.
    this.acceleration = vector2();
    this.mass = 1;
    ///...
}
//EULER INTEGRATION.
Entity.prototype.update = function (elapsed) {
    // Acceleration is usually 0 and is set from the outside.
    // Velocity is an amount of movement (meters or pixels) per second.
    this.velocity.x += this.acceleration.x * elapsed;
    this.velocity.y += this.acceleration.y * elapsed;

    this.position.x += this.velocity.x * elapsed;
    this.position.y += this.velocity.y * elapsed;

    ///...

    this.acceleration.x = this.acceleration.y = 0;
}

Entity.prototype.applyForce = function (force, scale) {
    if (typeof scale === 'undefined') {
        scale = 1;
    }
    this.acceleration.x += force.x * scale / this.mass;
    this.acceleration.y += force.y * scale / this.mass;
};

Entity.prototype.applyImpulse = function (impulse, scale) {
    if (typeof scale === 'undefined') {
        scale = 1;
    }
    this.velocity.x += impulse.x * scale / this.mass;
    this.velocity.y += impulse.y * scale / this.mass;
};


//gameneity
