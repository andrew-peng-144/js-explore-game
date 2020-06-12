import { hitboxList, Hitbox, Type, Category } from "./hitbox.js";
import { MyMath as Utils } from "./misc/mymath.js";

/**
 * Call every frame...
 */
function updateCollisionHandler() {

    //get collision pairs
    var pairs = queryForCollisionPairs();

    //resolve collisions by modifying other game logic. ~~resolve
    var c, h1, h2, e1, e2, enemy, player, fproj, eproj;
    for (c = 0; c < pairs.length; c++) {
        h1 = pairs[c].h1;
        h2 = pairs[c].h2;
        switch (h1.category | h2.category) {
            case Category.BLOCK | Category.PLAYER:
                console.log("wo");

                break;
        }
    }


}
function queryForCollisionPairs() {

    var i, j;
    /** @type {Hitbox}*/
    var h1;
    /**
      * @type {Hitbox}
      */
    var h2, pairs = [], len = hitboxList.length;

    for (i = 0; i < len; i++) {
        h1 = hitboxList[i];

        for (j = i + 1; j < len; j++) {
            h2 = hitboxList[j];

            if (h1.isStatic() && h2.isStatic()) continue; //ignore if both r static

            // if (h1.isSlope() || h2.isSlope()) { //Use separating axis theorem if either hitbox is not an axis-aligned rectangle.
            var dispkekdeletethislater, playerh,
                hB = h1.isStatic() ? h2 : h1,
                hA = hB === h2 ? h1 : h2;
            if (SAT(hA, hB)) pairs.push({ h1: hA, h2: hB });
            //}

            // else { //Otherwise, just use very basic rectangle intersection algorithm.
            //   if (Utils.intersectRect(h1, h2)) {
            //     pairs.push({ h1: h1, h2: h2 });
            //   }
            // }
        }
    }

    return pairs;
}
/**
 * SEPARATING AXIS THEOREM -- CONVEX POLYGONS ONLY, NO ARCS (yet)
 * @param {Hitbox} hitboxA 
 * @param {Hitbox} hitboxB 
 */
function SAT(hitboxA, hitboxB) {
    /**
     * 
     */
    var axesList = [], //list of all angles of the unique axes, in radians
        p1, p2, rad, vec;
    //sidesA, sidesB;

    
    //if (input.keyJustPressed(input.Key.K))
    //console.log(axesList);

    var pointsA = hitboxA.vertices;
    var pointsB = hitboxB.vertices;
    k(pointsA, axesList, p1, p2); k(pointsB, axesList, p1, p2);


    //for each axis:
    //loop thru points of first shape:
    //project each POINT to axis. 
    //get the min and max points
    //do the same for 2nd shape.
    //if they dont overlap, return false
    //otherwise repeat all this for all the other axes

    var comp, minA, maxA, minB, maxB, projVectors = [];

    for (var i = 0; i < axesList.length; i++) {
        rad = axesList[i];
        //Static-Kinematic collisions: A is static B is kinematic, so B gets position changed.
        //Kinematic-Kinematic collisions: B still only gets position changed.

        minA = Number.MAX_VALUE;
        maxA = -Number.MAX_VALUE;
        minB = Number.MAX_VALUE;
        maxB = -Number.MAX_VALUE;

        pointsA.forEach(function (point) {
            comp = Utils.dot(point.x, point.y, Math.cos(rad), Math.sin(rad)); //Scalar projection. The length of the vector projection.
            if (comp < minA) minA = comp;
            if (comp > maxA) maxA = comp;

        });
        pointsB.forEach(function (point) {
            comp = Utils.dot(point.x, point.y, Math.cos(rad), Math.sin(rad)); //Scalar projection
            if (comp < minB) minB = comp;
            if (comp > maxB) maxB = comp;

        });
        // if (input.keyJustPressed(input.Key.J)) {
        //     console.log("min a " + minA);
        //     console.log("max a " + maxA);
        //     console.log("min b " + minB);
        //     console.log("max b " + maxB);
        // }
        if (maxB < minA || maxA < minB) //if separated
            return false; //bail
        else { //the projections overlap. save the overlap vector for this axis.
            //B is the moving one.
            var o1 = maxA - minB;
            var o2 = minA - maxB;
            var mag;
            //the smaller difference is the overlap amount.
            if (Math.abs(o1) < Math.abs(o2)) {
                mag = o1;
            } else { mag = o2; }
            var vec = {
                x: mag * Math.cos(rad),
                y: mag * Math.sin(rad)
            };

            projVectors.push(vec);
        }

    }
    //collision detected

    //now find displacement only if one of the hitboxes is a BLOCK.
    if (hitboxA.category == Category.BLOCK || hitboxB.category == Category.BLOCK) {
        //smallest vector is the displacement
        var sizeList = [], vec, mag, min = Number.MAX_VALUE, disp;
        for (let i = 0; i < projVectors.length; i++) {
            vec = projVectors[i];
            mag = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
            if (mag < min) {
                min = mag;
                disp = vec;
            }

        }
        //apply to the non-block
        var nonBlock = hitboxA.category == Category.BLOCK ? hitboxB : hitboxA;
        nonBlock.addPosition(disp.x, disp.y)

    }

    return true;

}
/** I forgot */
function k(pointsList, axesList, p1, p2) {
    let vec, rad;
    for (let i = 0; i < pointsList.length; i++) {
        if (i == pointsList.length - 1) { p1 = pointsList[i]; p2 = pointsList[0] } //use first point if last index
        else { p1 = pointsList[i]; p2 = pointsList[i + 1] }
        //sidesList.push({ p1: p1, p2: p2 });
        vec = Utils.rotate90(p2.x - p1.x, p2.y - p1.y);
        rad = Math.atan2(vec.y, vec.x);
        //now confine the angle to the interval [0,pi] (because it's an axis, and axes extend twice the length as vectors). atan2 has range (-pi,pi]
        if (rad < 0) {
            rad += Math.PI;
        }
        if (m(rad, axesList))
            axesList.push(rad); //no duplicates
    }
}
/** I forgot 2 */
function m(rad, axesList) {
    for (let i = 0; i < axesList.length; i++) {
        if (Math.abs(axesList[i] - rad) < 0.00001)  //fails minimum difference threshold
            return false;
    }
    return true;
}
export { updateCollisionHandler };