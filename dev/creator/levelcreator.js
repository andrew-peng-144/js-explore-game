
'use strict';

$(document).ready(function () {
    //"global" variable declarations.
    const TILE_SIZE = 16;
    var GLOBAL = {
        assets: [],
        /** //TODO THIS IS STORED COMPLETELY INCORRECTLY! format: #define OFFSET(row, col, width) ((col)+(width)*(row)) */
        drawBuffer: [],
        mainCanvas: {},
        mcContext: {},
        paletteCanvas: {},
        pcContext: {},
        gridWidth: 100,
        gridHeight: 100,
        getTilesetTWidth: function () { return this.assets['tileset.png'].width / TILE_SIZE },
        getTilesetTHeight: function () { return this.assets['tileset.png'].height / TILE_SIZE },
        camera: {
            x: 0,
            y: 0,
            up: false, left: false, down: false, right: false,
            update: function () {
                var speed = 8;
                if (this.up) this.y -= speed;
                if (this.left) this.x -= speed;
                if (this.right) this.x += speed;
                if (this.down) this.y += speed;
            },
            zoom: 1
        },
        mouseIsDownMain: false
    }
    function init() {
        //LOAD ALL ASSETS first
        let imgNames = ["tileset.png"];
        let n, name,
            count = imgNames.length;
        if (count == 0) { init2(); }
        else {
            let onload = function (event) {
                if (--count == 0) {
                    //all assets done loading
                    init2();
                }
            };
            for (n = 0; n < imgNames.length; n++) {
                name = imgNames[n];
                GLOBAL.assets[name] = document.createElement('img');
                GLOBAL.assets[name].addEventListener('load', onload);
                GLOBAL.assets[name].src = "../assets/images/" + name;
            }
        }
    }
    function init2() {
        //init canvases.
        GLOBAL.mainCanvas = $("#mainCanvas")[0];
        GLOBAL.mcContext = GLOBAL.mainCanvas.getContext('2d');
        GLOBAL.mcContext.imageSmoothingEnabled = false;
        GLOBAL.paletteCanvas = $("#palette")[0];
        GLOBAL.pcContext = GLOBAL.paletteCanvas.getContext('2d');

        //Disable right click
        $("canvas").contextmenu(function () { return false; });

        //create the array that holds tile data: a 1d array of 0's
        for (let i = 0; i < GLOBAL.gridWidth * GLOBAL.gridHeight; i++) {
            GLOBAL.drawBuffer.push(0);
        }

        //KEY EVENTS
        $(document).on('keydown', function (e) {
            switch (e.which) {
                // case 87: camera.up = true; break;
                // case 65: camera.left = true; break;
                // case 83: camera.down = true; break;
                // case 68: camera.right = true; break;

                case 61: $('#stampWidth').get(0).stepUp(); break;
                case 173: $('#stampWidth').get(0).stepDown(); break;
                case 221: $('#stampHeight').get(0).stepUp(); break;
                case 219: $('#stampHeight').get(0).stepDown(); break;

                // case 81: isQCurrentlyDown = true; break;
                // case 69: isECurrentlyDown = true; break;

                case 71: $('#showGrid').get(0).checked = !$('#showGrid').get(0).checked;
            }
        });
        $(document).on('keyup', function (e) {
            switch (e.which) {
                // case 87: camera.up = false; break;
                // case 65: camera.left = false; break;
                // case 83: camera.down = false; break;
                // case 68: camera.right = false; break;

                // case 81: isQCurrentlyDown = false; break;
                // case 69: isECurrentlyDown = false; break;
            }
        });

        //MOUSE EVENTS
        $(GLOBAL.mainCanvas).mousemove(function (e) {
            let mouseX = e.clientX - this.getBoundingClientRect().left;
            let mouseY = e.clientY - this.getBoundingClientRect().top;
            $('#mouse-pos-display').text(Math.floor((mouseX + GLOBAL.camera.x) / TILE_SIZE) + "," + Math.floor((mouseY + GLOBAL.camera.y) / TILE_SIZE));

            //TODO keep drawing and updateing when mouse is moving AND mouse is down.
            if (GLOBAL.mouseIsDownMain) {
                redrawMain(mouseX, mouseY);
            }
        });

        $(GLOBAL.mainCanvas).mousedown(function (e) {
            GLOBAL.mouseIsDownMain = true;
            // switch (e.which) {
            //     case 1: isLeftMouseCurrentlyDown = true;
            //         break;
            //     case 3: isRightMouseCurrentlyDown = true; break;
            // }
            console.log(GLOBAL);
            redrawMain(e.clientX - this.getBoundingClientRect().left, e.clientY - this.getBoundingClientRect().top);
        });
        $(GLOBAL.mainCanvas).mouseup(function (e) {
            GLOBAL.mouseIsDownMain = false;
            // switch (e.which) {
            //     case 1: isLeftMouseCurrentlyDown = false;
            //         break;
            //     case 3: isRightMouseCurrentlyDown = false; break;
            // }

        });

        $(GLOBAL.paletteCanvas).mousedown(function (e) {
            var mouseX = e.clientX - this.getBoundingClientRect().left;
            var mouseY = e.clientY - this.getBoundingClientRect().top;
            var id = coordsToID(Math.floor(mouseX / TILE_SIZE), Math.floor(mouseY / TILE_SIZE));
            //set stampid value
            $("#stampID").val(id);
        });

        GLOBAL.paletteCanvas.width = GLOBAL.getTilesetTWidth() * TILE_SIZE;
        GLOBAL.paletteCanvas.height = GLOBAL.getTilesetTHeight() * TILE_SIZE;

        GLOBAL.pcContext.drawImage(GLOBAL.assets["tileset.png"], 0, 0);

        var currentPos1 = null, currentPos2 = null;

        //$("#create").click(downloadDAT);
        $("#copyLevelData").click(function () { copyStringToClipboard(JSON.stringify({ width: GLOBAL.gridWidth, map: GLOBAL.drawBuffer })); });

    }
    // var assets = [];
    // var drawBuffer = []; //large 1d array represengin the world.

    // var mainCanvas = $("#mainCanvas")[0];
    // /**
    // * @type {mainCanvasRenderingContext2D} ctx
    // */
    // var ctx = mainCanvas.getContext('2d');
    // ctx.imageSmoothingEnabled = false;
    // ctx.fillStyle = "#FFFFFF";

    // var paletteCanvas = document.getElementById('palette');
    // var paletteCanvasContext = paletteCanvas.getContext('2d');

    //~grid vars
    // var gridWidth = 500;
    // var gridHeight = 500;
    // const TILE_SIZE = 16.0; //used to write the hitboxes in output file. Will be used as id scalar

    // /**
    //  * x coord of mouse on mainCanvas.
    //  */
    // var mouseX;
    // var mouseY;
    // var isLeftMouseCurrentlyDown = false,
    //     isRightMouseCurrentlyDown = false,
    //     isQCurrentlyDown = false,
    //     isECurrentlyDown = false;


    //TODO resize the grid width & height. hardaf. copy the buffer into a new size that has the width/height consistent
    //expensive method
    function RESIZE() {

    }

    function downloadDAT() {
        console.log("wo");
        var textFile = null,
            makeDAT = function (arr) {
                var data = new Blob(arr, { type: 'text/plain' });
                //TODO problem with using ansi: 0 converts to '0' but 1 and all else correctly converts to its true ascii value (1 = SOH)
                //Side effect: There's no difference b/t id 0 and id 48.
                //Ez way to circumvent is to just not use id 48 lol...

                // If we are replacing a previously generated file we need to
                // manually revoke the object URL to avoid memory leaks.
                if (textFile !== null) {
                    window.URL.revokeObjectURL(textFile);
                }

                textFile = window.URL.createObjectURL(data);

                // returns a URL you can use as a href
                //TODO write the width of the text file as the first line, then all data on second.
                return textFile;
            };

        var link = document.createElement('a');
        link.setAttribute('download', 'testworld.txt');
        console.log("wo2");
        link.href = makeDAT(GLOBAL.drawBuffer);
        console.log("wo3");
        document.body.appendChild(link);
        // wait for the link to be added to the document
        window.requestAnimationFrame(function () {
            var event = new MouseEvent('click');
            link.dispatchEvent(event);
            document.body.removeChild(link);
        });
    }

    function copyStringToClipboard(str) {
        var copyText = document.getElementById("clipboard");
        copyText.value = str;
        /* Select the text field */
        copyText.select();

        copyText.setSelectionRange(0, 99999); /*For mobile devices*/

        /* Copy the text inside the text field */
        document.execCommand("copy");
        alert("Copied the text: " + copyText.value);
    }


    /**
     * 
     * @param {Number} x integer of the X TILE
     * @param {Number} y Y TILE
     * @return true if buffer was edited false otherwise
     */
    function editDrawBuffer(x, y, id) {
        if (x >= 0 && y >= 0 && x < GLOBAL.gridWidth) {
            GLOBAL.drawBuffer[OFFSET(Math.floor(y), Math.floor(x), GLOBAL.gridWidth)] = id; //String.fromCharCode(id);
            return true;
        } else { return false; }
    }
    function OFFSET(row, col, width) { return (col) + (width) * (row) }

    /**
     * 
     * @param {*} x tru x position the canvas/mouse position
     * @param {*} y 
     * @param {*} id 
     */
    function drawTileToWorld(x, y, id) {
        var coords = IDtoCoords(id);
        GLOBAL.mcContext.drawImage(GLOBAL.assets['tileset.png'],
            coords.tx * TILE_SIZE, coords.ty * TILE_SIZE, TILE_SIZE, TILE_SIZE,
            Math.floor(x / TILE_SIZE) * TILE_SIZE, Math.floor(y / TILE_SIZE) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    /**
     * Update the drawBuffer array AND draw the new tile(s).
     * 
     * @param {Number} x The x coordinate of the mouse on the canvas.
     * @param {Number} y  "
     */
    function redrawMain(x, y) {
        var wx = x + GLOBAL.camera.x;
        var wy = y + GLOBAL.camera.y;
        let id;


        // debugger;\

        //if (wx > 0 && wx < GLOBAL.gridWidth * TILE_SIZE && wy > 0 && wy < GLOBAL.gridHeight * TILE_SIZE) {
        id = parseInt($('#stampID').val()) || 1;
        if (editDrawBuffer(Math.floor(wx / TILE_SIZE), Math.floor(wy / TILE_SIZE), id)) {
            //TODO account for camera
            drawTileToWorld(x, y, id);
        }



        // var mouseWx = mouseX + camera.x;
        // var mouseWy = mouseY + camera.y;

        //TODO larger brush sizes, setwise (?)


        // camera.update();
    }
    function drawVisibleTiles() {
        //only render visible tiles. id of -1 means no tile is at that pos.
        var x, y, md, id,
            xi = Math.floor(camera.x / TILE_SIZE), //these 4 are in units of tiles.
            xf = Math.ceil((camera.x + mainCanvas.width) / TILE_SIZE),
            yi = Math.floor(camera.y / TILE_SIZE),
            yf = Math.ceil((camera.y + mainCanvas.height) / TILE_SIZE);
        //console.log("xi " + xi + " xf " + xf + " yi " + yi + " yf" + yf);
        //var tileIdMap = JSON.parse($('#mapTileData').text());
        var tileIdMap = $asdfsadfsda;
        for (x = xi; x < xf; x++) {
            for (y = yi; y < yf; y++) {

                if (tileIdMap[x] !== undefined && tileIdMap[x][y] !== undefined && tileIdMap[x][y] > 0) { //The tileID at the position exists and is >0.
                    id = tileIdMap[x][y];
                    drawTileToWorld(id, x, y);

                }
            }
        }
    }
    function coordsToID(tx, ty) {
        return tx + ty * GLOBAL.getTilesetTWidth() + 1;
    }
    function IDtoCoords(id) {
        return { tx: (id - 1) % GLOBAL.getTilesetTWidth(), ty: Math.floor((id - 1) / GLOBAL.getTilesetTWidth()) };
    }
    //TODO draw grid


    // //more jQuery events
    // var cti_i = $("#coords-to-id input[type='number']");
    // //$('#coords-to-id-submit').click(
    // cti_i.change(
    //     function (e) {
    //         $('#coords-to-id-result').text("" + coordsToID(
    //             parseInt(cti_i.get(0).value),
    //             parseInt(cti_i.get(1).value)
    //         ))
    //     }
    // );



    var Help = {
        rectContainsPoint: function (x, y, w, h, px, py) {
            return x <= px && px <= x + w &&
                y <= py && py <= y + h;
        },
        removeFromList: function (list, thing) {
            var index = list.indexOf(thing);
            if (index >= 0) {
                console.log("Successful removal of " + args.object.constructor.name);
                list.splice(index, 1);
            }
            else {
                console.log("UNSUCCESSFUL removal of " + thing.constructor.name);
            }
        }
    }

    init();

});
