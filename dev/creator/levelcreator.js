'use strict';
//TODOs:
/*
    Keep everything event-driven, but idk about camera.

    General:
        Don't do the clipboard method, instead, do Blob downloading.
      o  Zooming capabilities.
      +  Make draw canvas much larger and the palette canvas directly on top of it in the corner.
      +  right click to erase
      +  Resize canvas while working.
        Resize entire grid. (needa copy old one in a certain way)
        show grid.
        IMPORT json into world.
        To not lose data upon refresh (save into localstorage?)
        Click and drag to pan the set, instead of wasd.

    Draw tile mode:
        hold shift then = - to inc/dec by 5 at a time.
      ?  hold shift then WASD to move a lot more at a time.
        Smoother tile drawing in general -- calc old and new positoin and fill in all tiles in a line between them?
        Draw a line of tiles?
        Draw a shape of tiles?
        Scatter tiles in random positions in specified area?


    Draw object/"prop" mode: (e.g. a tree u can walk behind and in front of.)
        show the "object" palette instead of the tile palette
        Place object
        Place 

    Place point modes: ("point" is a pixel in the world, but must be at the center of a tile..)
        Place enemy spawn point.
        Place stationary NPC. (give name/uuid?)
        Place other (specify data)

    POS1 POS2 modes:
        large rectangle tool
        create solid object rect
        create zone. sep. by type. (e.g. tp, stair, slowarea, pit)
        create slope. sep. by type.
    
    one-way graph mode:
        create one-way graph. type (for override path, for npc normal pathing)


*/
import { Camera } from "./camera.js";

$(document).ready(function () {
    //"global" variable declarations.
    const TILE_SIZE = 16;
    var GLOBAL = {
        /** a dictionary of String -> DOMImageElement */
        assets: [],
        /** @type {Number[]} */
        drawBuffer: [],
        mainCanvas: {},
        /** @type {CanvasRenderingContext2D} */
        mcContext: {},
        paletteCanvas: {},
        /** @type {CanvasRenderingContext2D} */
        pcContext: {},
        gridWidth: 200, //capped at 100KB??? clipboard? or textarea???
        gridHeight: 200,
        getTilesetTWidth: function () { return this.assets['tileset.png'].width / TILE_SIZE },
        getTilesetTHeight: function () { return this.assets['tileset.png'].height / TILE_SIZE },
        leftMouseIsDownMain: false,
        rightMouseIsDownMain: false,
        zoom: 1
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
        console.log(GLOBAL.getTilesetTWidth() + "wo" + GLOBAL.getTilesetTHeight());
        //init canvases.
        GLOBAL.mainCanvas = $("#mainCanvas")[0];
        GLOBAL.mcContext = GLOBAL.mainCanvas.getContext('2d');

        GLOBAL.paletteCanvas = $("#palette")[0];
        GLOBAL.pcContext = GLOBAL.paletteCanvas.getContext('2d');

        //init bounds for canvases, and attach them to resize event
        var resizeMainCanvas = function () {
            GLOBAL.mainCanvas.width = window.innerWidth * 0.965;
            GLOBAL.mainCanvas.height = window.innerHeight * 0.75;
            GLOBAL.mcContext.imageSmoothingEnabled = false; //changing width/height after makes this true somehow
            redrawMain();
        }
        resizeMainCanvas();
        window.addEventListener('resize', resizeMainCanvas);

        //Disable right click
        $("canvas").contextmenu(function () { return false; });

        //create the array that holds tile data: a 1d array of 0's
        for (let i = 0; i < GLOBAL.gridWidth * GLOBAL.gridHeight; i++) {
            GLOBAL.drawBuffer.push(0);
        }

        //KEY EVENTS
        $(document).on('keydown', function (e) {
            e.preventDefault();
            switch (e.which) {
                // case 87: scrollMap(87); break; //W
                // case 65: camera.left = true; break; //A
                // case 83: camera.down = true; break; //S
                // case 68: camera.right = true; break; //D
                case 87: case 65: case 83: case 68:
                    Camera.onKeyDown(e.which);
                    break;

                case 61: $('#stampWidth').get(0).stepUp(); break;
                case 173: $('#stampWidth').get(0).stepDown(); break;
                case 221: $('#stampHeight').get(0).stepUp(); break;
                case 219: $('#stampHeight').get(0).stepDown(); break;

                case 37: setStampIDAndRedrawPalette(getIDfromLabel() - 1); break; //left arrow
                case 38: setStampIDAndRedrawPalette(getIDfromLabel() - GLOBAL.getTilesetTWidth()); break; //up
                case 39: setStampIDAndRedrawPalette(getIDfromLabel() + 1); break;//right
                case 40: setStampIDAndRedrawPalette(getIDfromLabel() + GLOBAL.getTilesetTWidth()); break; //down

                // case 81: isQCurrentlyDown = true; break;
                // case 69: isECurrentlyDown = true; break;

                case 71: $('#showGrid').get(0).checked = !$('#showGrid').get(0).checked;
            }
        });
        $(document).on('keyup', function (e) {
            switch (e.which) {
                case 87: case 65: case 83: case 68:
                    Camera.onKeyUp(e.which);
                    //redrawMain();
                    break;
            }
        });

        //CONSTANTLY RUNNING EVERY 20ms: UPDATE THE CAMERA AND IF ITS UPDATE SUCCESFULLY, REDRAW.
        //TODO performance hog?
        window.setInterval(function () {
            if (Camera.update()) {
                redrawMain();
            }
        }, 40);

        //MOUSE EVENTS

        $(GLOBAL.mainCanvas).contextmenu(function (e) { e.preventDefault; });

        $(GLOBAL.mainCanvas).mousemove(function (e) {
            let mouseX = e.clientX - this.getBoundingClientRect().left;
            let mouseY = e.clientY - this.getBoundingClientRect().top;
            $('#mouse-pos-display').text(Math.floor((mouseX + Camera.getX()) / TILE_SIZE) + "," + Math.floor((mouseY + Camera.getY()) / TILE_SIZE));

            //keep drawing and updateing when mouse is moving AND mouse is down (either left or right).
            if (GLOBAL.leftMouseIsDownMain || GLOBAL.rightMouseIsDownMain) {
                placeAndDrawTilesOnClick(mouseX, mouseY,
                    $("#stampWidth").val(),
                    $("#stampHeight").val()
                );
            }
            
            //E.WHICH DOESNT WORK FOR MOUSEMOVE!!!!!!!!!!!

        });

        $(GLOBAL.mainCanvas).mousedown(function (e) {

            switch (e.which) {
                case 1: GLOBAL.leftMouseIsDownMain = true;
                    break;
                case 3: GLOBAL.rightMouseIsDownMain = true;
                    break;
            }
            //console.log(GLOBAL);
            placeAndDrawTilesOnClick(
                e.clientX - this.getBoundingClientRect().left,
                e.clientY - this.getBoundingClientRect().top,
                $("#stampWidth").val(),
                $("#stampHeight").val()
            );
        });
        $(GLOBAL.mainCanvas).mouseup(function (e) {
            switch (e.which) {
                case 1: GLOBAL.leftMouseIsDownMain = false;
                    break;
                case 3: GLOBAL.rightMouseIsDownMain = false;
                    break;
            }

        });

        $(GLOBAL.paletteCanvas).mousedown(function (e) {
            var mouseX = e.clientX - this.getBoundingClientRect().left;
            var mouseY = e.clientY - this.getBoundingClientRect().top;
            var id = coordsToID(Math.floor(mouseX / TILE_SIZE), Math.floor(mouseY / TILE_SIZE));
            //set stampid value
            setStampIDAndRedrawPalette(id);
            redrawPalette();
        });

        //SLIDER
        let sliderZoomEl = document.querySelector("#sliderZoom");
        sliderZoomEl.addEventListener("input", function (e) {
            debugger;
            GLOBAL.zoom = Number.parseInt(this.value);
            redrawMain();
        });

        //WHEEL SCROLLING.
        GLOBAL.mainCanvas.addEventListener("wheel", function (event) {
            event.preventDefault();
            if (event.deltaY < 0) {
                // Zoom in
                //document.querySelector("#sliderZoom").value += 1;
                sliderZoomEl.value = Number.parseInt(sliderZoomEl.value) + 1;
                //TODO move camera position after, to account for the new view...
            }
            else {
                // Zoom out
                //document.querySelector("#sliderZoom").value -= 1;
                sliderZoomEl.value = Number.parseInt(sliderZoomEl.value) - 1;

            }
            sliderZoomEl.dispatchEvent(new Event('input'));
        });

        GLOBAL.paletteCanvas.width = GLOBAL.getTilesetTWidth() * TILE_SIZE;
        GLOBAL.paletteCanvas.height = GLOBAL.getTilesetTHeight() * TILE_SIZE;

        //GLOBAL.pcContext.drawImage(GLOBAL.assets["tileset.png"], 0, 0);
        redrawPalette();

        var currentPos1 = null, currentPos2 = null;

        //$("#create").click(downloadDAT);
        //$("#copyLevelData").click(function () { copyStringToClipboard(JSON.stringify({ width: GLOBAL.gridWidth, map: GLOBAL.drawBuffer })); });
        $("#copyoutputtoclip").click(copyOutputAreaToClipboard);
        $("#updatenow").click(updateOutputArea);
        window.setInterval(updateOutputArea, 60000);
    }



    /**
     * Sets the stamp ID AND redraws the palette canvas.
     * if id is invalid, shows warning but does nothing else. */
    function setStampIDAndRedrawPalette(id) {
        try {
            validateID(id);
        } catch (err) {
            console.log(err + ":tried to set invalid stamp id");
            return;
        }
        $("#stampID").val(id);
        redrawPalette();
    }


    //TODO resize the grid width & height. hardaf. copy the buffer into a new size that has the width/height consistent
    //expensive method
    function resizeMap(newTWidth, newTHeight) {

    }

    /**
     * //TODO
     * resizes the canvas to draw stuff on. much easier than resizemap
     * @param {Number} newWidth 
     * @param {Number} newHeight 
     */
    function resizeMainCanvas(newWidth, newHeight) {

    }




    /**
     * updates the output text area with a special JSON string {width, map}
     */
    function updateOutputArea() {
        var outputArea = document.getElementById("output");
        outputArea.value = JSON.stringify({ width: GLOBAL.gridWidth, map: GLOBAL.drawBuffer });
    }

    function copyOutputAreaToClipboard() {
        var copyText = document.getElementById("output");
        copyText.select();

        copyText.setSelectionRange(0, 99999); /*For mobile devices*/

        /* Copy the text inside the text field */
        document.execCommand("copy");
        alert("Copied the text: " + copyText.value);
    }

    /**
     * USE THIS TO CHANGE VALUES IN THE DRAW BUFFER.
     * @param {Number} x integer of the X TILE
     * @param {Number} y Y TILE
     * @return true if params are valid and buffer was edited, false otherwise 
     */
    function editDrawBuffer(x, y, id = 0) {
        if (x >= 0 && y >= 0 && x < GLOBAL.gridWidth && y < GLOBAL.gridHeight) {
            GLOBAL.drawBuffer[Math.floor(x) + Math.floor(y) * GLOBAL.gridWidth] = id; //String.fromCharCode(id);
            return true;
        } else { return false; }
    }
    //function OFFSET(row, col, width) { return (col) + (width) * (row) }

    /**
     * Clears and redraws the entire main canvas, including all tiles IN THE VIEWPORT. Call when panning, resizing,...
     */
    function redrawMain() {
        GLOBAL.mcContext.clearRect(0, 0, GLOBAL.mainCanvas.width, GLOBAL.mainCanvas.height);

        let x, y, id, //x: x coodinate of the map array.
            xi = Math.floor(Camera.getExactX() / TILE_SIZE), //these 4 are in units of tiles. in the world.
            xf = Math.ceil((Camera.getExactX() + GLOBAL.mainCanvas.width) / TILE_SIZE),
            yi = Math.floor(Camera.getExactY() / TILE_SIZE),
            yf = Math.ceil((Camera.getExactY() + GLOBAL.mainCanvas.height) / TILE_SIZE);

        for (x = xi; x < xf; x++) {
            for (y = yi; y < yf; y++) {
                if (x >= 0 && y >= 0 && x < GLOBAL.gridWidth) { //prevent looping...
                    id = GLOBAL.drawBuffer[x + GLOBAL.gridWidth * y];
                    if (id > 0) {
                        drawTileToWorld(x * TILE_SIZE, y * TILE_SIZE, id); //x and y here are in WORLD TILES.
                    }
                }
            }
        }
    }

    /**
     * actually draws the new tile to the world
     * If x, y, or id are out of bounds/invalid, logs and does nothing else.
     * @param {*} x WORLD x position
     * @param {*} y 
     * @param {*} id 
     */
    function drawTileToWorld(x, y, id) {
        try {
            validateWorldCoords(x, y);
            validateID(id);
        } catch (err) {
            if (id == 0) {
                clearRectWorld(x, y, TILE_SIZE, TILE_SIZE);
            } else {
            console.log(err); 
            }
            return;
        }
        GLOBAL.mcContext.drawImage(GLOBAL.assets['tileset.png'],
            (id - 1) % GLOBAL.getTilesetTWidth() * TILE_SIZE,
            Math.floor((id - 1) / GLOBAL.getTilesetTWidth()) * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE,
            (x - Camera.getX()) * GLOBAL.zoom,
            (y - Camera.getY()) * GLOBAL.zoom,
            TILE_SIZE * GLOBAL.zoom,
            TILE_SIZE * GLOBAL.zoom);
    }

    /**
     * Clears a rectangle of the main canvas of the specified bounds, GIVEN IN WORLD COORDS.
     */
    function clearRectWorld(x, y, w, h) {
        GLOBAL.mcContext.clearRect(
            (x - Camera.getX()) * GLOBAL.zoom,
            (y - Camera.getY()) * GLOBAL.zoom,
            w * GLOBAL.zoom,
            h * GLOBAL.zoom
        )
    }
    /**
     * Update the drawBuffer array AND draw the new tile AT WORLD COORDINATES clipped to grid.
     * 
     * @param {Number} wx world x
     * @param {Number} wy  "    y
     * @param {Number} id the id to draw.
     */
    function placeAndDrawNewTile(wx, wy, id = 0) {
        // var wx = x + Camera.getX();
        // var wy = y + Camera.getY();
        //let id;
        debugger;
        //if (wx > 0 && wx < GLOBAL.gridWidth * TILE_SIZE && wy > 0 && wy < GLOBAL.gridHeight * TILE_SIZE) {
        //id = getIDfromLabel();
        if (editDrawBuffer(Math.floor(wx / TILE_SIZE), Math.floor(wy / TILE_SIZE), id)) {
            drawTileToWorld(Math.floor(wx / TILE_SIZE) * TILE_SIZE, Math.floor(wy / TILE_SIZE) * TILE_SIZE, id);

            //Draw the tile to the canvas, clipped onto the grid.
            //var coords = IDtoCoords(id);
            //drawTileToWorld(wx * TILE_SIZE, wy * TILE_SIZE, id);
            // GLOBAL.mcContext.drawImage(GLOBAL.assets['tileset.png'],
            //     coords.tx * TILE_SIZE,
            //     coords.ty * TILE_SIZE,
            //     TILE_SIZE, TILE_SIZE,
            //     Math.floor(x / TILE_SIZE) * TILE_SIZE,// - Camera.getX(),
            //     Math.floor(y / TILE_SIZE) * TILE_SIZE,// - Camera.getY(),
            //     TILE_SIZE, TILE_SIZE)
        }
        // var mouseWx = mouseX + camera.x;
        // var mouseWy = mouseY + camera.y;

        //TODO larger brush sizes, setwise (?)


        // camera.update();
    }

    /**
     * Update the drawBuffer array with the new tiles of the SAME ID, and draw the new tiles.
     * //TODO: This function accounts for zoom when detecting where to place new tile based on mouse click position.
     * @param {Number} x The x coordinate of the mouse on the canvas, in pixels, not accounting for zoom
     */
    function placeAndDrawTilesOnClick(x, y, width, height) {
        debugger;
        let id = GLOBAL.rightMouseIsDownMain ? 0 : getIDfromLabel();
        for (let w = 0; w < width; w++) {
            for (let h = 0; h < height; h++) {
                placeAndDrawNewTile(
                    x / GLOBAL.zoom + Camera.getX() + TILE_SIZE * w,
                    y / GLOBAL.zoom + Camera.getY() + TILE_SIZE * h,
                    id);
            }
        }
    }

    /**
     * reads the stampID label
     * so this isn't super performance friendly?
     */
    function getIDfromLabel() {
        return parseInt($('#stampID').val()) || 1;
    }

    /**
     * Redraws the palette canvas.
     * For now, everything stays the same except the square depicting which tile(s?) is selected!
     * so it's not optimized since it redraws the entire palette too.
     */
    function redrawPalette() {
        GLOBAL.pcContext.clearRect(0, 0, GLOBAL.paletteCanvas.width, GLOBAL.paletteCanvas.height);
        GLOBAL.pcContext.drawImage(GLOBAL.assets["tileset.png"], 0, 0);

        let id = getIDfromLabel();
        let wo = IDtoCoords(id);
        GLOBAL.pcContext.beginPath();
        GLOBAL.pcContext.rect(wo.tx * TILE_SIZE, wo.ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        GLOBAL.pcContext.stroke()



    }

    /**
     * converts tile-based coords to id val, for palette.
     * coords must be in bounds or throws error
     */
    function coordsToID(tx, ty) {
        if (tx < 0 || ty < 0 || tx > GLOBAL.getTilesetTWidth() || ty > GLOBAL.getTilesetTHeight()) {
            throw "bad coords";
        }
        return tx + ty * GLOBAL.getTilesetTWidth() + 1;
    }
    /**
     * converts a positive int to {tx,ty}.
     * id must be in bounds or throws error
     */
    function IDtoCoords(id) {
        validateID();
        return { tx: (id - 1) % GLOBAL.getTilesetTWidth(), ty: Math.floor((id - 1) / GLOBAL.getTilesetTWidth()) };
    }

    /**
     * THROWS ERROR if id not valid.
     * valid id means 1 to widht*height INCLSUIVE.
     */
    function validateID(id) {
        if (id < 1 || id > GLOBAL.getTilesetTWidth() * GLOBAL.getTilesetTHeight()) {
            throw "bad id";
        }
    }

    /**
     * THROWS ERROR if coordinates IN WORLD are not within the bounds of the grid.
     */
    function validateWorldCoords(wx, wy) {
        if (wx < 0 || wy < 0 || wx > GLOBAL.gridWidth * TILE_SIZE || wy > GLOBAL.gridHeight * TILE_SIZE) {
            throw "bad world coords";
        }
    }

    //TODO draw tile outline grid






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
