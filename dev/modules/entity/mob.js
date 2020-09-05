//Psycho 100.
import * as Engine from "../../engine/engine.js";
import * as ImageDef from "../imagedef.js";
function Mob(hp) {
    this.hp = hp;
    this.entID = Engine.GameEntity.createEntity();
    let a = Engine.PhysicsComponent.create(this.entID)
        .setRectangleHitbox(550, 420, 10, 10)
        .setControlFunc(() => {
            return { dx: 0.5, dy: 0.4 }
        });

    Engine.RenderComponent.create(this.entID)
        .setSection(ImageDef.sections().LINKIN)
        .linkPosToPhysics(a);
}
function create(hp) {
    return new Mob(hp);
}
export { create };