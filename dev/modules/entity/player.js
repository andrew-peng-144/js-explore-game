

var Player = {};

var MovementState = {
    STILL: 0,
    RUNNING: 1,
    CLIMBING_LADDER: 2,
    UNCONTROLLABLE: 3,
    IDFKLMFAO: 4
}
Player.currentState = 0;

// Player.draw = function (ctx) {
//     switch (MovementState) {
//         case MovementState.STILL: break;
//     }
//     Player.gameEntity.draw(ctx);

// }

Player.update = function () {
    let speed = 2.69420//1*Math.sqrt(2);
    let rad = 0;
    let up = Input.keyPressed(KeyCode.W),
        left = Input.keyPressed(KeyCode.A),
        down = Input.keyPressed(KeyCode.S),
        right = Input.keyPressed(KeyCode.D),
        pi = Math.PI;
    if (up && left && down && right) { console.log('all'); stop(); }
    if (up && left) { rad = 5 * pi / 4; }
    else if (up && right) { rad = 7 * pi / 4; }
    else if (down && left) { rad = 3 * pi / 4; }
    else if (down && right) { rad = pi / 4; }
    else if (up && down || left && right) { rad = null; }
    else if (up) { rad = 3 * pi / 2; }
    else if (left) { rad = pi; }
    else if (down) { rad = pi / 2; }
    else if (right) { rad = 2 * pi; }
    else { rad = null; } //didnt move
    if (rad) {
 
        //Player.gameEntity.hitbox.setVelocityRT(speed, rad);
        Player.gameEntity.kinematicComponent.setVelocityRT(speed, rad);
        this.currentState = MovementState.RUNNING;
    } else {
        //Player.gameEntity.hitbox.setVelocity(0, 0);
        Player.gameEntity.kinematicComponent.setVelX(0).setVelY(0);
        this.currentState = MovementState.STILL;
    }
}
Player.init = function () {
    Player.gameEntity = GameEntity.createGenericEntity(50, 60)
        .withRectActorHitbox(34.69, 52.345345, Hitbox.Category.PLAYER )
        .withRenderComponent(Image.IMAGE.BLAZEN)
        .withKinematicComponent();
}

export { Player };