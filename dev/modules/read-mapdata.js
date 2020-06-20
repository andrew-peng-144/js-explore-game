//READS the tiles data from txt.
//test 1000x1000. shud be ~1MB
//output a uint8 array 1 million long. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays

//use FileReader
//actually use AJAX. read from the server.

var levelDataFile = "testingdiag.json";

//THIS IS SYNCHRONOUS. THAT MEANS EVERYTHING PAUSES UNTIL DIS IS LOADED. meaning the ENTIRE DOCUMENT! if the map's too big then it'll freeze! ree!
var ReadMapData = {
    mapArr: null,
    mapTWidth: null,
    init: null
};

function loadDoc(url) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("Load dat end: " + new Date().getTime());
            //ReadMapData.mapArr = str2view(this.responseText);
            var obj = JSON.parse(this.responseText);
            ReadMapData.mapArr = obj.map;
            ReadMapData.mapTWidth = obj.width;
        }
    };
    xhttp.open("GET", url, false); //synchronous. //TODO  make async later with loading?
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

ReadMapData.init = function () {
    console.log("Load dat start: " + new Date().getTime());
    loadDoc("assets/leveldata/" + levelDataFile);
}



export { ReadMapData };