/*
    Rework.
    have an ID system and actually remove the class itself and only store IDs in respective components
    And positoin won't be stored globally, instead the physicscomponent will have its own x and y and render will too.


    Now this has higher coupling with the respective Components
*/
//import * as Hitbox from "./hitbox.js";
import * as RenderComponent from "./render-component.js"
//import * as AssetLoader from "../main/assetloader.js";
//import * as KinematicComponent from "./kinematic-component.js";
import * as InputComponent from "./input-component.js";
import * as Behavior from "./behavior.js";
//var idCounter = 0; //unique id for each gameentity
import * as PhysicsComponent from "./physics-component.js";


var id_counter = 0; //0 is invalid id

/**
 * on this frame?
 * @type {Set<Number>}
 */
let entIDs_to_remove = new Set();

//"GAME DATA" ------------
//All gameentities have an object as an attribute, representing all of this entity's concrete game data - such as an actor's health value, and any attribute associated to a value.
//by default, this object is just a blank javascript Object. It can be set using setData or createEntity.
//This is to easily associate a specific entity with its concrete game data. Useful for collision.
/*
"Also note that if you are minifying your code, it's not safe to compare against hard-coded type strings.
For example instead of checking if obj.constructor.name == "MyType", instead check obj.constructor.name == MyType.name"
*/
/**
 * maps the entity id to a data object. Its default type (its constructor name) is "Object"
 * @type {Map<number, Object>}
 */
var gameDataMap = new Map();

/**
 * Returns a new Unique ID that represents a GameEntity.
 * To add components, use a component's static create() method and pass in this ID.
 * @param {Object} data the concrete game-data, preferably typed (a constructor name other than "Object") that this entity logically has, e.g. a health value.
 * Can also be set with GameEntity.setData
 */
function createEntity(data) {
    let id = ++id_counter;
    if (typeof data !== "object") {
        data = {};
        //console.log("default data for entity #" + id);
    }
    gameDataMap.set(id, data);
    return id;
}

function getData(id) {
    return gameDataMap.get(id);
}
function setData(id, data) {
    gameDataMap.set(id, data);
}

/**
 * Immediately remove the gameEntity from the system.
 */
function removeNow(id) {
    InputComponent.remove(id);
    PhysicsComponent.remove(id);
    RenderComponent.remove(id);
    Behavior.remove(id);
    gameDataMap.delete(id);
}

/**
 * Mark a GameEntity for removal. The Entity still functions normally until clearQueue() is called.
 * @param {Number} id 
 */
function queueRemoval(id) {
    entIDs_to_remove.add(id);
}

/**
 * Immediately removes any marked-gameEntity from the game. Typically, call this after render()
 */
function clearQueue() {
    entIDs_to_remove.forEach(id => {
        removeNow(id);
    });

    entIDs_to_remove.clear();
}



/** Calls updateAll() on these component types in THIS ORDER:
 * input, physics, behavior
 */
function updateAll() {
    InputComponent.updateAll();
    //Engine.Entity.updateKinematicComponents();
    //Engine.Entity.handleHitboxCollisions();
    PhysicsComponent.updateAll();

    Behavior.updateAll();
}

/**
 * Calls drawAll() on gameentities' rendercomponents, then clears the Removal queue.
 */
function drawAll() {
    RenderComponent.drawAll();
    clearQueue();
}

/**
 * debugging function that logs each entity to the console.
 * Not memory safe. don't spam
 */
function logAllEntityData() {

    for (let i = 1; i <= id_counter; i++) {
        if (gameDataMap.has(i)) {
            //not deleted
            let obj = gameDataMap.get(i);
            let output = "entity #" + i + " (" + obj.constructor.name + ") : {";
            for (var property in obj) {
                output += property + ': ' + obj[property] + '; ';
            }
            console.log(output + "}");
        }
    }
    //console.log(arr);
}

export { createEntity, getData, setData, removeNow, queueRemoval, clearQueue, updateAll, drawAll, logAllEntityData }
//export { newGenericEntity, newActorEntity, GameEntity };