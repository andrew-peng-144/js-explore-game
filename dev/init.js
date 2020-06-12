//Main initializations.
import { InputInit } from "./modules/input.js";
import * as Constants from "./modules/globals.js";
import { TileMapRenderer } from "./modules/tilemap-renderer.js";
import { ReadMapData } from "./modules/read-mapdata.js";
import * as Hitbox from "./modules/hitbox.js";
import { Player } from "./modules/entity/player.js";
import { loadAssets } from "./modules/assetloader.js";
import * as GameEntity from "./modules/gameentity.js";
import { IMAGE } from "./modules/image.js";
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
    // for (let i = 0; i < 10; i++) {
    //     Hitbox.newRectBlockHitbox(5 + i * 50, 5 + i * 50, 10, 20);
    // }
    Hitbox.newSlopeBlockHitbox(0,0,20,50,1);
    Hitbox.newSlopeBlockHitbox(0,300,40,50,2);
    Hitbox.newSlopeBlockHitbox(300,0,50,50,3);
    Hitbox.newSlopeBlockHitbox(300,300,20,20,4);

    var xd = Hitbox.newRectActorHitbox(0,0,20,30,null,Hitbox.Category.ENEMY);
    xd.setAcceleration(0.01,0);

    for (let i = 0; i < 500; i += 20) {
        tempEntityList.push(
            GameEntity.newGenericEntity(200 + i, 20 + i, IMAGE.BOB),
            GameEntity.newGenericEntity( i, 300 + i, IMAGE.BLAZEN),
            GameEntity.newGenericEntity(100+ i, 300 + i, IMAGE.FIRE)
        );
    }

    //load assets
    loadAssets(callback);

}



export { init, Canvas, Context, tempEntityList };