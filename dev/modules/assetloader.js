var assets;
function loadAssets(start) {

    var imageNames = ['clouds_test_bkgd.png', 'sprites.png', 'tileset.png', 'props.png'];
    var audioNames = [];
    var onload;
    assets = [];
    var n, name,
        count = imageNames.length + audioNames.length;
    if (count == 0) {
        start();
    }
    else {
        onload = function (event) {
            if (--count == 0) {
                //all assets done loading
                start();
                //document.dispatchEvent(new Event("assetsLoaded"));
            }
        };

        for (n = 0; n < imageNames.length; n++) {

            name = imageNames[n];
            assets[name] = document.createElement('img');
            assets[name].addEventListener('load', onload);
            assets[name].src = "./assets/images/" + name;

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

export { assets, loadAssets };