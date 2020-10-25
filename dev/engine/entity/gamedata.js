//Merged to GameEntity -- All gameentities have GameData by default and will be assigned a "Default" type.

//A component that can actually be any js object to reprensent some data
//it holds all of this entity's concrete game data - such as an actor's health value, and any attribute associated to a value.
//This is to easily associate a specific entity with its concrete game data. Useful for collision.

//HAS COUPLING WITH PHYSICS COMPONENT -- handling functions ONLY work for PC's whose entities also have a GameData... and the function is defined.

/*
"Also note that if you are minifying your code, it's not safe to compare against hard-coded type strings.
For example instead of checking if obj.constructor.name == "MyType", instead check obj.constructor.name == MyType.name"
*/

/**
 * maps the entity id to a data object.
 * @type {Map<number, Object>}
 */
var dataComponents = new Map();

/**
 * lets the gameentity contain concrete game data. returns the data, which can be used to set attribute
 */
function create(id) {
    let yes = new Object()
    dataComponents.set(id, yes);
    return yes;
}
function remove(id) {
    dataComponents.delete(id);
}
/**
 * NOT CONSTANT TIME. memoize for better performance
 */
function get(id) {
    return dataComponents.get(id);
}
//export {create, remove, get}