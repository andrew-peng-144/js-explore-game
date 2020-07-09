//Main initializations.
import { InputInit } from "./modules/input.js";
import * as Constants from "./modules/globals.js";
import { TileMapRenderer } from "./modules/tilemap-renderer.js";
import { ReadMapData } from "./modules/read-mapdata.js";
import { Hitbox } from "./modules/hitbox.js";
import { Player } from "./modules/entity/player.js";
import { loadAssets } from "./modules/assetloader.js";
// import * as GameEntity from "./modules/gameentity.js";
import { IMAGE } from "./modules/imagedef.js";
import { Block } from "./modules/entity/block.js"
/**
 * @property {CanvasRenderingContext2D} gui w w 
 */
var Canvas = {
    gui, main, bkgd// terrain, propBkgd, entity, propFrgd
}
var Context = {
    gui, main, bkgd//, propBkgd, entity, propFrgd
}

function getCtx(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return ctx;
}


var tempEntityList =[];
function init(callback) {

    //canvases and contexts
    Canvas.gui = document.getElementById('gui');
    Canvas.gui.width = Constants.V_WIDTH;
    Canvas.gui.height = Constants.V_HEIGHT;
    Context.gui = getCtx(Canvas.gui);

    Canvas.main = document.getElementById('main');
    Canvas.main.width = Constants.V_WIDTH;
    Canvas.main.height = Constants.V_HEIGHT;
    Context.main = getCtx(Canvas.main);

    Canvas.bkgd = document.getElementById('bkgd');
    Canvas.bkgd.width = Constants.V_WIDTH;
    Canvas.bkgd.height = Constants.V_HEIGHT;
    Context.bkgd = getCtx(Canvas.bkgd);

    // Canvas.terrain = document.getElementById('terrain');
    // Canvas.terrain.width = Constants.V_WIDTH;
    // Canvas.terrain.height = Constants.V_HEIGHT;
    // Context.terrain = getCtx(Canvas.terrain);

    // Canvas.propBkgd = document.getElementById('propBkgd');
    // Canvas.propBkgd.width = Constants.V_WIDTH;
    // Canvas.propBkgd.height = Constants.V_HEIGHT;
    // Context.propBkgd = getCtx(Canvas.propBkgd);

    // Canvas.entity = document.getElementById('entity');
    // Canvas.entity.width = Constants.V_WIDTH;
    // Canvas.entity.height = Constants.V_HEIGHT;
    // Context.entity = getCtx(Canvas.entity);

    // Canvas.propFrgd = document.getElementById('propFrgd');
    // Canvas.propFrgd.width = Constants.V_WIDTM;
    // Canvas.propFrgd.height = Constants.V_HEIGHT;
    // Context.propFrgd = getCtx(Canvas.propFrgd);

    // var MAIN_FSM = new StateMachine({
    //     init: 'menu',
    //     transitions: [
    //         { name: 'clicplay', from: 'menu', to: 'ingame1' }
    //     ],
    //     methods: {
    //         onClicplay: function () { console.log('went ingame1') }
    //     }
    // });
    // console.log(MAIN_FSM.is("menu"));

    //asset loading
    //document.addEventListener("assetsLoaded", function() {});

    //init input
    InputInit();
    //TODO mouse input.

    //Load a placeholder map
    ReadMapData.init();

    //create entities.
    Player.init();

    //create sum BLOCKS lul
    new Block(100,120,50,70);

    loadAssets(callback);

}



export { init, Canvas, Context, tempEntityList };