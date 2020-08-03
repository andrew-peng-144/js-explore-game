//attach per-frame scripting on entities.
//since js forms closures, the context for the vars in the func is usually in its own file (like player.js, enemy.js)

let behaviorSet = new Set();

function addBehavior(func) {
    behaviorSet.add(func);
    return func;
}
function updateAll() {
    behaviorSet.forEach(b => {
        b();
    });
}
function remove(func) {
    behaviorSet.delete(func);
}

function getCount() {
    return behaviorSet.size;
}

export {addBehavior, updateAll, getCount, remove};