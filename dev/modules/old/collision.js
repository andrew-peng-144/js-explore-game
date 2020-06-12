var Type = {
    DEFAULT: 0,
    BLOCK: 1,
    PLAYER: 2,
    ENEMY: 4,
    FRIENDLY_PROJECTILE: 8,
    ENEMY_PROJECTILE: 16,
    TELEPORTER: 32,
    b6: 64,
    b7: 128,
    b8: 256,
    b9: 512,
    b10: 1024,
    b11: 2048,
    b12: 4096,
    b13: 8192,
    b14: 16384,
    b15: 32768,
    b16: 65536,
    b17: 131072 //BOMBER!!!!!!!!!
}
var hitboxList = [];

function Hitbox(vertices, entityRef, type, static, solid) {

    this.vertices = vertices;
    this.entityRef = entityRef;
    this.type = type || p.Type.DEFAULT;
    this.static = static || false;
    this.solid = solid || false;
    this.dx = 0;
    this.dy = 0;
    this.ddx = 0;
    this.ddy = 0;
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


var pairs = queryForCollisionPairs();

//resolve collisions by modifying other game logic. ~~resolve
var c, h1, h2, e1, e2, enemy, player, fproj, eproj,
    t = this.Type;
for (c = 0; c < pairs.length; c++) {
    h1 = pairs[c].h1;
    h2 = pairs[c].h2;
    e1 = h1.getEntity();
    e2 = h2.getEntity();
    switch (h1.type | h2.type) {
        case t.PLAYER | t.BLOCK:
            //resolveStaticKinematic(h1, h2);
            break;
        case t.FRIENDLY_PROJECTILE | t.BLOCK:
        case t.ENEMY_PROJECTILE | t.BLOCK:
            console.log("yes");
            ingame.projectileHandler.removeProjectile(e1 ? (e1.isClass("Projectile") ? e1 : e2) : e2);
            break;
        case t.ENEMY | t.FRIENDLY_PROJECTILE:

            enemy = e1.isClass("Enemy") ? e1 : e2;
            fproj = enemy === e1 ? e2 : e1;

            enemy.addHP(-fproj.damage || -1);
            if (enemy.health <= 0) enemy.kill();
            ingame.projectileHandler.removeProjectile(fproj);

            break;
        case t.ENEMY_PROJECTILE | t.PLAYER:
            break;
        case t.PLAYER | t.ENEMY:
            console.log("ouch");
            break;
        case t.PLAYER | t.TELEPORTER:
            //load the map that the lz points to
            break;
    }
}

function SAT(hitboxA, hitboxB) {
    /**
     * 
     */
    var axesList = [], //list of all angles of the unique axes, in radians
        p1, p2, rad, vec;
    //sidesA, sidesB;

    function k(pointsList) {
        for (var i = 0; i < pointsList.length; i++) {
            if (i == pointsList.length - 1) { p1 = pointsList[i]; p2 = pointsList[0] } //use first point if last index
            else { p1 = pointsList[i], p2 = pointsList[i + 1] }
            //sidesList.push({ p1: p1, p2: p2 });
            vec = Utils.rotate90(p2.x - p1.x, p2.y - p1.y);
            rad = Math.atan2(vec.y, vec.x);
            //now confine the angle to the interval [0,pi] (because it's an axis, and axes extend twice the length as vectors). atan2 has range (-pi,pi]
            if (rad < 0) {
                rad += Math.PI;
            }
            if (m(rad))
                axesList.push(rad); //no duplicates
        }
        function m(rad) {
            for (let i = 0; i < axesList.length; i++) {
                if (Math.abs(axesList[i] - rad) < 0.00001)  //fails minimum difference threshold
                    return false;
            }
            return true;
        }
    }
    if (input.keyJustPressed(input.Key.K))
        console.log(axesList);

    var pointsA = hitboxA.vertices;
    var pointsB = hitboxB.vertices;
    k(pointsA); k(pointsB);


    //for each axis:
    //loop thru points of first shape:
    //project each POINT to axis. 
    //get the min and max points
    //do the same for 2nd shape.
    //if they dont overlap, return false
    //otherwise repeat all this for all the other axes

    var comp, minA, maxA, minB, maxB, rad, projVectors = [];

    for (var i = 0; i < axesList.length; i++) {
        rad = axesList[i];
        //Static-Kinematic collisions: A is static B is kinematic, so B gets position changed.
        //Kinematic-Kinematic collisions: B still only gets position changed.

        minA = Number.MAX_VALUE, maxA = -Number.MAX_VALUE,
            minB = Number.MAX_VALUE, maxB = -Number.MAX_VALUE;

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
        if (input.keyJustPressed(input.Key.J)) {
            console.log("min a " + minA);
            console.log("max a " + maxA);
            console.log("min b " + minB);
            console.log("max b " + maxB);
        }
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
    //now find displacement if both are solid. & apply that displacement.
    if (hitboxA.solid && hitboxB.solid) {
        //smallest vector is the displacement
        var sizeList = [], vec, mag, min = Number.MAX_VALUE, disp;
        for (var i = 0; i < projVectors.length; i++) {
            vec = projVectors[i];
            mag = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
            if (mag < min) {
                min = mag;
                disp = vec;
            }

        }
        //apply
        hitboxB.addPosition(disp.x, disp.y)

    }

    return true;

}