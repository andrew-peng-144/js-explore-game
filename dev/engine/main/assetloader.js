var assets = {};
var numAssets = 0;
/**
 * ONLY SUPPORTS IMAGES FOR NOW.
 * @param {String[]} assetPaths list of string FULL paths for each asset
 * @param {Function} callback 
 */
function loadAssets(assetPaths, callback) {
    if (!Array.isArray(assetPaths) || typeof callback !== "function") {
        throw "bru";
    }

    // var imageNames = ['clouds_test_bkgd.png', 'sprites.png', 'tileset.png', 'props.png'];
    // var audioNames = [];
    var onload;
    //assets = [];
    var n, name;
    var count = assetPaths.length;
    numAssets = count;
    //count = imageNames.length + audioNames.length;
    if (count == 0) {
        callback();
    }
    else {
        onload = function (event) {
            if (--count == 0) {
                //all assets done loading
                callback();
                //document.dispatchEvent(new Event("assetsLoaded"));
            }
        };

        for (n = 0; n < assetPaths.length; n++) {

            name = assetPaths[n];
            assets[name] = document.createElement('img');
            assets[name].addEventListener('load', onload);
            assets[name].src = name;

        }
    }
    //TODO MUSIC
    // for (n = 0; n < audioNames.length; n++) {
    //   name = audioNames[n];
    //   result[name] = document.createElement('img');
    //   result[name].addEventListener('load', onload);
    //   result[name].src = "images/" + name + ".png";
    // }
    return assets;
}

function getNumAssets() {
    return numAssets;
}

export { assets, loadAssets, getNumAssets };