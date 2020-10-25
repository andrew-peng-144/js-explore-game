//on the Tiled map editor, objects on the map can have a certain Type defined to them
//types, such as InterNode and Teleport, defind on the Tiled map

//Type definitions

/**
 * construct a default internode data with default values
 */
function InterNode() {
    this.nodeID = 0;
    this.dest_node = 0;
    this.dest_map = "ahh.json";
}

function StoneWow_() {

}

export {InterNode};