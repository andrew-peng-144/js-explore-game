//on github issue

var dict = {};

/**
 * 
 * @param {*} name 
 * @param {*} desc 
 * @param {*} data any js object with relevant data.
 */
function Item(name, desc, data) {
    this.name = name;
    this.desc = desc;
    this.data = data || null;
}
function fill() {
    dict[0] = new Item("Gold Coin", "One gold piece. Considerable buying power.");
    dict[3] = new Item("Wooden Sword", "Wow.", new WeaponData("sword", 3, 30));
}

/**
 * duck typin
 * @param {*} obj 
 */
function isItem(obj) {
    return typeof obj.name === "string"
    && typeof obj.desc === "string"
    && typeof obj.data === "object"
}

/////////DATA
//When name and description is not enough information for a item definition
//Like equipment

function WeaponData(clazz, damage, delay) {
    if (typeof damage !== "number" || typeof delay !== "number" || typeof clazz !== "string") {
        throw "nah";
    }
    this.clazz = clazz;
    this.damage = damage;
    this.delay = delay;

}

function ArmorData(defense) {
    if (typeof defense !== "number") {
        throw "nah";
    }
    this.defense = defense;
}

export {isItem}