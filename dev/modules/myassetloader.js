var assets = {};
var numAssets = 0;
/**
 * ONLY SUPPORTS IMAGES FOR NOW.
 * Only the engine should call this.
 * @param {String[]} assetPaths list of string FULL paths for each asset
 * @param {Function} callback 
 */
function loadAssets(assetPaths, onImageLoad) {
    if (!Array.isArray(assetPaths) || typeof onImageLoad !== "function" || assetPaths.length === 0) {
        throw "bru";
    }

    // var imageNames = ['clouds_test_bkgd.png', 'sprites.png', 'tileset.png', 'props.png'];
    // var audioNames = [];
    //assets = [];
    var n, name;
    //var count = assetPaths.length;
    //numAssets = count;
    //count = imageNames.length + audioNames.length;


    for (n = 0; n < assetPaths.length; n++) {

        name = assetPaths[n];
        assets[name] = document.createElement('img');
        assets[name].addEventListener('load', onImageLoad);
        assets[name].src = name;

    }

    //TODO MUSIC
    // for (n = 0; n < audioNames.length; n++) {
    //   name = audioNames[n];
    //   result[name] = document.createElement('img');
    //   result[name].addEventListener('load', onload);
    //   result[name].src = "images/" + name + ".png";
    // 
    //return assets;
}

function getNumAssets() {
    return numAssets;
}

function getAsset(pathStr) {
    return assets[pathStr];
}

export { assets, getAsset, loadAssets, getNumAssets };