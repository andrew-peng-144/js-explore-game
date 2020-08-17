//A component that allows attaching per-frame custom scripting on entities
//since js forms closures, the context for the vars in the func is usually in its own file (like player.js, enemy.js)

/**
 * @type {Map<number, Function}
 */
let behaviors = new Map();

function create(id, func) {
    // behaviors.add(func);
    if (behaviors.has(id)) {
        throw id + " already has a behavior.";
    }
    behaviors.set(id, func);
    return func;
}
function updateAll() {
    behaviors.forEach(b => {
        b();
    });
}
function remove(id) {
    behaviors.delete(id);
}

function getCount() {
    return behaviors.size;
}

export { create, updateAll, getCount, remove };