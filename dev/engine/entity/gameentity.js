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
 * @type {Set<Number>}
 */
let entIDs_to_remove = new Set();

/**
 * Returns a new Unique ID that represents a GameEntity.
 * To add components, use a component's static create() method and pass in this ID.
 */
function createEntity() {
    let id = ++id_counter;
    return id;
}

/**
 * Immediately remove the gameEntity from the system.
 */
function removeNow(id) {
    InputComponent.remove(id);
    PhysicsComponent.remove(id);
    RenderComponent.remove(id);
    Behavior.remove(id);
}

/**
 * Mark a GameEntity for removal. The Entity still functions normally until clearQueue() is called.
 * @param {Number} id 
 */
function queueRemoval(id) {
    entIDs_to_remove.add(id);
}

/**
 * Immediately removes any marked-gameEntity from the game. Typically, call this after your render()
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

export { createEntity, removeNow, queueRemoval, clearQueue, updateAll, drawAll }
//export { newGenericEntity, newActorEntity, GameEntity };