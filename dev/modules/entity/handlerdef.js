//define collison handling methods.
//exports the function that add them all to mainstate.
import * as Engine from "../../engine/engine.js"

import * as MainState from "../gamestate/mainstate.js";
import * as Player from "../entity/player.js";
import * as TiledObject from "./TiledObject.js";
import * as Mob from "../entity/mob.js";

function player_mob(player_eid, mob_eid) {
    console.log("ouch.kekw, player hit mob w/ eid #" + mob_eid);
}

function playermelee_mob(playermelee_eid, mob_eid) {
    //decrease mob hp omegalul.
    //use querying... the playermelee is a query, but it actually is a temporary entity with only data and no components.
    //could also be a permanant entity that just has its data mutated depending on the player's attack strength...
    //either way, in this context, it should still be treated exactly the same as a normal entity
}

//Important. this collision is not the tpe of stuff this flie should handle
//because it involves global things like changing state, loading new map... nothing local to just the player and the node.
//therefore the meat of this collision case should still be handled in mainstate, where more global occurences happen
//so just delegate it to the mainstate.
function player_InterNode(player_eid, internode_eid) {
    //player hits a internode...

    //send SIGNAL to mainstate? along with the data of the internode: the id, map to goto, etc. (list all here)
    //and mainstate only handles the signal at a certain time. handling the signal clears it.
    console.log("handler knows player hit internode");
    MainState.signal(3, Engine.GameEntity.getData(internode_eid));
}

/**
 * adds all the handler functions to the physics engine
 */
function init() {
    let ncc = Engine.PhysicsComponent.newCollisionCase;
    ncc(player_InterNode, Player.PlayerData.name, TiledObject.InterNode.name);
    ncc(player_mob, Player.PlayerData.name, Mob.MobData.name);
    //ncc(playermelee_mob, Player.)
}
export { init };