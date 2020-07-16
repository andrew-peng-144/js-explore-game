//not done f.
import * as Hitbox from "../engine/hitbox.js";
import { Camera } from "./camera.js";
import { ZOOM } from "../globals.js";
function drawHitboxes(context) {
    context.save();
    /**@type {Hitbox.Hitbox} */
    var h,
        i;

    for (i = 0; i < Hitbox.hitboxList.length; i++) {
        var h = Hitbox.hitboxList[i];
        context.fillStyle = (function () {
            switch (h.category) {
                case Hitbox.Category.BLOCK:
                    return 'rgba(20,20,200,0.4)';
                case Hitbox.Category.FRIENDLY_PROJECTILE:
                    return 'rgba(20,200,20,0.4)';
                default:
                    return 'rgba(154,137,243,0.4)';
            }
        })();

        //draw RECTS
        Hitbox.hitboxList.forEach(h => {
            if (h.shape.constructor.name === "RectangleShape") {
                context.fillRect(
                    (h.entityRef.x - h.shape.width/2 - h.offX - Camera.getExactX()) * ZOOM, //TODO not accounting for the hitbox offset, which idk what pos/neg offset actually is anyways
                    (h.entityRef.y - h.shape.height/2 - h.offY - Camera.getExactY()) * ZOOM,
                    h.shape.width * ZOOM,
                    h.shape.height * ZOOM
                );
            }
        });

        //below is for drawing polygonz.

        // var points = h.vertices;
        // var ctx = context;
        // ctx.save();

        // ctx.beginPath();
        // ctx.moveTo(Math.round((points[0].x - Camera.getExactX()) * ZOOM), Math.round((points[0].y - Camera.getExactY()) * ZOOM));
        // var p;
        // for (let i = 1; i < points.length; i++) { //must use let. var would change the outer loop's
        //     p = points[i];
        //     ctx.lineTo(Math.round((p.x - Camera.getExactX()) * ZOOM), Math.round((p.y - Camera.getExactY()) * ZOOM));
        // }
        // ctx.closePath();
        // ctx.fill();

        // ctx.restore();
        //}
        // else {
        //   if (input.keyJustPressed(input.Key.R))
        //     console.log(h);
        //   C.bufferCC.fillRect(Math.round(h.x - camera.getExactX()), Math.round(h.y - camera.getExactY()), h.width, h.height);
        // }
    }
    context.restore();
}

export { drawHitboxes };