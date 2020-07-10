//top level module

import { TILE_SIZE, V_WIDTH, V_HEIGHT, STEP, ZOOM } from "./modules/globals.js";
import { init, Canvas, Context } from "./init.js";
import { Input, KeyCode } from "./modules/input.js";

import { IMAGE, MyImage } from "./modules/image.js";

import { PubSub } from "./modules/pubsub.js";

import * as Hitbox from "./modules/hitbox.js"
import { updateCollisionHandler } from "./modules/collisionHandler.js";

import { drawImageToScreen } from "./modules/draw.js";

import { Camera } from "./modules/camera.js";

import { ReadMapData } from "./modules/read-mapdata.js";

import { TileMapRenderer } from "./modules/tilemap-renderer.js";

import * as DrawHitboxes from "./modules/draw-hitbox.js";
import { Player } from "./modules/entity/player.js";

import * as AssetLoader from "./modules/assetloader.js";
import * as RenderComponent from "./modules/render-component.js";
import * as KinematicComponent from "./modules/kinematic-component.js";
(function () {
    function UPDATE(T) {


        //order TODO
        //DOM flags

        //input flags (unneeded, already event-handled.)

        //update physics: update positions first, then do all collisions. (or other order? idk?)
        //stepWorld();

        //handle input for player... (Since this is done after stepworld, it adds 1 frame (17ms) of input delay)
        Player.update();

        KinematicComponent.kinematicComponents.forEach(e => e.update());
        updateCollisionHandler();
        //but for hitboxes that CHANGE the vel/accel of colliding objects, those should be updated before stepWorld?

        Camera.update(Player, V_WIDTH / ZOOM, V_HEIGHT / ZOOM);
    }

    function RENDER(R) {
        //Context.entity.clearRect(0,0,V_WIDTH,V_HEIGHT);
        Context.main.clearRect(0, 0, V_WIDTH, V_HEIGHT);

        TileMapRenderer.render(Context.main, assets['tileset.png'], 16);

        //TODO layers

        //get all moving entities and insertion-sort by y val rip.
        //includes: player, enemies, not projectiles
        //Player.draw(Context.main);

        //wow.
        RenderComponent.renderComponents.forEach(r => r.draw(Context.main));

        // //projectiles
        // this.projectileHandler.renderAll();

        //temp
        //tempEntityList.forEach(e => e.draw(Context.main));

        //(fallen) items
        //ingame.drawStillImageToWorld(IMAGE.UGLY_BLADE, 50, 50 + timing.commonCounters.itemHover.getCurrentNumber());

        //hitboxes (Debug)
        DrawHitboxes.drawHitboxes(Context.main);


    }
    var assets;
    var framesElapsed = 0;
    var loop = (function () {
        var now,
            dt = 0,
            last = timestamp(),
            step = STEP;
        var pub = {};
        function frame() {
            //TODO pausing, loop still runs but ignore update and render
            now = timestamp();

            dt = dt + Math.min(1, (now - last) / 1000);
            while (dt > step) {
                dt = dt - step;
                UPDATE();
            }
            RENDER();
            last = now;
            framesElapsed++;
            requestAnimationFrame(frame);
        }
        function timestamp() {
            return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
        }
        pub.run = function () {
            // game loop goes here
            requestAnimationFrame(frame);

        }
        pub.getDeltaTime = function () { return dt };
        return pub;
    }());


    // /**
    //  * Draws image at the given frame onto world at given coords.
    //  * An alternative to doing gameobject.draw
    //  */
    // function drawAnimatedImageToWorld(image, currentFrame, wx, wy) {
    //     C.bufferCC.drawImage(assets[image.fileStr], (currentFrame || image.sxt) * TILE_SIZE, image.syt * TILE_SIZE, image.swt * TILE_SIZE, image.sht * TILE_SIZE,
    //         Math.round(wx - camera.getExactX()), Math.round(wy - camera.getExactY()), image.swt * TILE_SIZE, image.sht * TILE_SIZE);
    // }


    init(loop.run);
    assets = AssetLoader.assets;
    // var eventwo = new Event('ripserver');
    // document.addEventListener('ripserver', e => {drawImage(Canvases.bkgd, IMAGE.CLOUD_BKGD, 0, 0)});
    // document.addEventListener("click",e=>{document.dispatchEvent(eventwo)});
    // var triggerlul;
    // var triggerlul69;
    // {
    //     var lul = { name: "my name! " };
    //     PubSub.enable(lul);
    //     lul.subscribe(69, function (arg) { console.log("wo" + this.name + arg); });
    //     lul.subscribe(69, function (arg) { console.log("wo2" + this.name + arg); });
    //     triggerlul = lul.publish.bind(lul);
    //     triggerlul69 = lul.publish.bind(lul, 69);
    // }
    // document.addEventListener("click", e => {
    //     triggerlul(69, " Vacant!"); triggerlul69(" Cleanroom!");
    //     drawImageToScreen(assets, Context.bkgd, IMAGE.CLOUD_BKGD, 0, 0, V_WIDTH, V_HEIGHT);
    // });



})();