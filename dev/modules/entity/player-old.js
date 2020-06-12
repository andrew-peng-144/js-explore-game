var p = {};
var vs = [
    new Point(0, 3), new Point(3, 0), new Point(13, 0), new Point(16, 3),
    new Point(16, 13), new Point(13, 16), new Point(3, 16), new Point(0, 13)
];
p.gameObject = new GameObject(
    //physics.newHitbox(vs, p, physics.Type.PLAYER, false, true),
    physics.newOctagonalHitbox(0, 0, TILE_SIZE, TILE_SIZE, 4, p, physics.Type.PLAYER, false, true),
    IMAGE.NPC1,
    4, TILE_SIZE
)
//p.hitbox = physics.newAABB(0, 0, 16, 16, p, physics.Type.PLAYER, false, true);
// p.getRoundedX = function () {
//   return Math.round(hitbox.x);
// }
// p.getRoundedY = function () {
//   return Math.round(hitbox.y)
// }
p.getX = function () {
    return (this.gameObject.hitbox.getFirstPoint().x);
}
p.getY = function () {
    return (this.gameObject.hitbox.getFirstPoint().y);
}


var up, left, down, right, shift, up_jp, left_jp, down_jp, right_jp,
    up_jr, left_jr, down_jr, right_jr = false,
    RUN_SPEED = 5,
    WALK_SPEED = 2,
    maxSpeed = RUN_SPEED,
    currentSpeed = 3,
    angle = 0,
    pi = Math.PI,
    v = 1,
    accel = 0.5,
    count = 0;

p.update = function () {



    //   h.y -= Math.min(maxSpeed, (i += accel));
    // else i = 1;
    var h = p.gameObject.hitbox;
    up = input.keyPressed(input.Key.W);
    left = input.keyPressed(input.Key.A);
    down = input.keyPressed(input.Key.S);
    right = input.keyPressed(input.Key.D);
    shift = input.keyPressed(input.Key.SHIFT);

    up_jp = input.keyJustPressed(input.Key.W);
    left_jp = input.keyJustPressed(input.Key.A);
    down_jp = input.keyJustPressed(input.Key.S);
    right_jp = input.keyJustPressed(input.Key.D);

    up_jr = input.keyJustReleased(input.Key.W);
    left_jr = input.keyJustReleased(input.Key.A);
    down_jr = input.keyJustReleased(input.Key.S);
    right_jr = input.keyJustReleased(input.Key.D);

    //FAIL LUL
    //mk3 : better incorporates physics engine, attempting acceleration
    // if (up_jp)
    //   h.addVelocity(0, -maxSpeed);
    // else if (up_jr)
    //   h.addVelocity(0, maxSpeed);
    // if (left_jp)
    //   h.addVelocity(-maxSpeed, 0);
    // else if (left_jr)
    //   h.addVelocity(maxSpeed,0);
    // if (down_jp)
    //   h.addVelocity(0, maxSpeed);
    // else if (down_jr)
    //   h.addVelocity(0, -maxSpeed);
    // if (right_jp)
    //   h.addVelocity(maxSpeed, 0);
    // else if (right_jr)
    //   h.addVelocity(-maxSpeed,0);


    //mk2 : 8 separate directions with handling special cases

    if (up && left && down && right) { console.log('all'); stop(); }
    else if (up && left) { angle = 5 * pi / 4; }
    else if (up && right) { angle = 7 * pi / 4; }
    else if (down && left) { angle = 3 * pi / 4; }
    else if (down && right) { angle = pi / 4; }
    else if (up && down || left && right) { stop(); }
    else if (up) { angle = 3 * pi / 2; }
    else if (left) { angle = pi; }
    else if (down) { angle = pi / 2; }
    else if (right) { angle = 2 * pi; }
    else { stop(); } //didnt move
    function stop() { angle = null; v = 1; };
    if (shift) maxSpeed = WALK_SPEED;
    else maxSpeed = RUN_SPEED;
    if (angle) {
        //currentSpeed = Math.min(maxSpeed, (v += accel));
        h.setVelocity(maxSpeed * Math.cos(angle), maxSpeed * Math.sin(angle));
    } else { h.setVelocity(0, 0) }

    //mk1 : all 4 directions independent

    // if (w && a) { h.y -= diagComp, h.x -= diagComp }
    // else if (w && d) { h.y -= diagComp, h.x += diagComp }
    // else if (s && a) { h.y += diagComp, h.x -= diagComp }
    // else if (s && d) { h.y += diagComp, h.x += diagComp }
    // if (w)
    //   h.y -= maxSpeed;
    // if (a)
    //   h.x -= maxSpeed;
    // if (s)
    //   h.y += maxSpeed;
    // if (d)
    //   h.x += maxSpeed;


    //FIRE
    if (input.keyJustReleased(input.Key.I) || input.mouseJustDown(input.Mouse.LEFT)) {
        var x = h.vertices[0].x;
        var y = h.vertices[1].y;
        // projectiles.push(new Projectile(projGenerated, h.x, h.y, 5, Utils.vectorFromTo(h.x - camera.getX() + 8, h.y - camera.getY() + 8, mousePosition.x, mousePosition.y).getAngle(), 2, 4, 1, 1));
        var angle = Utils.vectorFromTo(x - camera.getExactX() + 8, y - camera.getExactY() + 8, mousePosition.x, mousePosition.y).getAngle();
        //ingame.fields.projectiles.push(new AnimatedProjectile(ingame.fields.projGenerated, h.x, h.y, 2, angle, 2, 4, 4, 1, 1, 30));
        //ingame.fields.projectiles.push(new AnimatedProjectile(h.x, h.y, 2, angle, 2, 4, 4, 1, 1, 30))
        var img = IMAGE.BOB;
        var scale = 0.8;
        ingame.projectileHandler.newProjectile(x, y, img.getWidth() * scale, img.getHeight() * scale, 2.786696969, angle, IMAGE.BOB, 300, physics.Type.FRIENDLY_PROJECTILE);
    }
};
p.render = function () {
    //C.bufferCC.fillStyle = '#abcdef';

    //C.bufferCC.fillRect(h.x - camera.getX(), h.y - camera.getY(), h.width, h.height);
    //ingame.drawTileToWorld(assets["sprites.png"], p.getX(), p.getY(), 2, 0, 1, 2)
    ingame.drawStillImageToWorld(IMAGE.FIRE_BLADE, p.getX(), p.getY());
}
