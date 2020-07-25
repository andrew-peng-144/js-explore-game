/*
/READS the tiles data from txt.
//AND LOADS THEM INTO RAM

EXAMPLES OF MAP DATA:
    * the tiles themselves
    * solid walls/blocks
    * "props" - stationary objects that respond to some rendering order.
    * entities - just an "id" that points to a predefined entity listed in a glossary somewhere.
    *


//test 1000x1000. shud be ~1MB
//output a uint8 array 1 million long. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
//thi shas a 256 tile limit


//use FileReader
//actually use AJAX. read from the server.
*/
var levelDataFile = "testing3.json";

//SYNCHRONOUS MEANS EVERYTHING PAUSES UNTIL DIS IS LOADED. meaning the ENTIRE DOCUMENT! if the map's too big then it'll freeze! ree!

let mapArr = null;
let mapTWidth = null;
let init = null;
let mapLoaded = false;


function loadDoc(url) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("Load dat end: " + new Date().getTime());
            //ReadMapData.mapArr = str2view(this.responseText);
            var obj = JSON.parse(this.responseText);
            mapArr = obj.map;
            mapTWidth = obj.width;
            mapLoaded = true;
        }
    };
    xhttp.open("GET", url, false); //synchronous. //TODO make asynchronous when loading states are implemented
    xhttp.send();
}

/**
 * String to VIEW of array buffer
 * F. gotta use uint16 instead of uint8 array, oh well.
 * @param {String} str 
 * @return {Uint16Array}
 */
function str2view(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    //return buf;
    return bufView;
}

/**
 * Loads the level data from the given path into RAM.
 * @param {String} path
 */
let read = function (path) {
    console.log("Load map start: " + new Date().getTime());
    loadDoc(path);
}

function getMapArray() {
    return mapArr;
}
function getMapWidthInTiles() {
    return mapTWidth;
}
function hasLoaded() {
    return mapLoaded;
}



export { read, getMapArray, getMapWidthInTiles, hasLoaded };