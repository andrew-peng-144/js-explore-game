//player's inventory
//grid

//Design choice: Don't need to access inventory during battle. All things for battel should be up and ready to use from the HUD directly.
//the hud should be simple enough. the combat mechanics should be simple enough.
//inventory usage cases:
/*

- to see how many of an item
- to use a specific item for a quest or something.
- can sell itemz?

*/

import * as Item from "./item.js";

var inventory = new Map();

function addItem(item, quantity) {
    if (!Item.isItem(item)) {
        throw "bru";
    }
    inventory.set(item, quantity);
}