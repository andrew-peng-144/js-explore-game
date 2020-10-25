//Psycho 100.
import * as Engine from "../../engine/engine.js";
import * as ImageDef from "../imagedef.js";
function MobData() {
    this.hp = 5;
    this.maxhp = 5;

}
/**
 * placeholder creation of a mob omegalul.
 * @param {*} hp
 * @returns the entity ID.
 */
function create(wx = 550, wy = 420, hp) {
    let mobData = new MobData();
    mobData.hp = hp;
    mobData.maxhp = hp;

    let eid = Engine.GameEntity.createEntity(mobData);
    let a = Engine.PhysicsComponent.create(eid)
        .setRectangleHitbox(wx, wy, 10, 10);

    Engine.RenderComponent.create(eid)
        .setSection(ImageDef.sections().LINKIN)
        .linkPosToPhysics(a);
}
export { create, MobData };