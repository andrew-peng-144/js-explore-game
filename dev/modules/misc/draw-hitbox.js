//not done f.
import * as Engine from "../../engine/engine.js";
import * as DEBUG_PhysicsComponent from "../../engine/entity/physics-component.js";
function drawHitboxes(context, camera) {
    context.save();
    var hitboxes,
        i, zoom = Engine.ZOOM;

        let pcList = DEBUG_PhysicsComponent.DEBUG_physicsComps;
    context.fillStyle = 'rgba(154,137,243,0.8)';
    for (i = 0; i < pcList.length; i++) {
        hitboxes = pcList[i]._opts._hitboxes;
        hitboxes.forEach(h => {
            //draw RECTS
            if (h.constructor.name === "RectangleHitbox") {
                //debugger;
                context.fillRect(
                    (pcList[i].entityRef.getX() - h.width / 2 - h.xOff - camera.getExactX()) * zoom, //TODO not accounting for the hitbox offset, which idk what pos/neg offset actually is anyways
                    (pcList[i].entityRef.getY() - h.height / 2 - h.yOff - camera.getExactY()) * zoom,
                    h.width * zoom,
                    h.height * zoom
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