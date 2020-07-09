//an interface that allows coding paths for entities. or like a sequecne of inputs.

function EntityController(gameEntity) {
    this.gameEntity = gameEntity;
}
EntityController.prototype.update() {
    //do instruction
    gameEntity.dx = 5;
}