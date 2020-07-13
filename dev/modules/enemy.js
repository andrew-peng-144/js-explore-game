var enemyHandler = (function () {
    var eh = {};
    var enemies = [];

    eh.getEnemyList = function () { return enemies };
    eh.newEnemy = function () {
      var e = new Enemy();
      enemies.push(e);
      return e;
    }
    eh.newEnemy = function (x, y) {
      var e = new Enemy(x, y);
      enemies.push(e);
      return e;
    }
    var Behavior = {
      Shuffle: function () {

      }
    };

    function Enemy() {
      //this.sprite = new Sprite(0, 0, IMAGE.GOHST);
      this.health = 5;
      this.damage = 1;
      /**@type {GameObject}  */
      this.gameObject = new GameObject(
        physics.newAABB(100, 100, 50, 27.6969, this, physics.Type.ENEMY, false, false),
        IMAGE.GOHST
      );
      this.behavior = Behavior.Shuffle;
    }
    function Enemy(x, y) {
      this.health = 5;
      this.damage = 1;
      /**@type {GameObject}  */
      this.gameObject = new GameObject(
        physics.newAABB(x, y, 50, 27.6969, this, physics.Type.ENEMY, false, false),
        IMAGE.GOHST
      );
      this.behavior = Behavior.Shuffle;
    }
    /**
     * removes all of its hitboxes
     * removes all of its timers
     * removes all references to the enemy
     */
    Enemy.prototype.kill = function () {
      //for (var i = 0; i < this.hitboxes.length; i++)
      CEH.request(EVENT.REMOVE_FROM_LIST, { list: physics.getHitboxList(), object: this.gameObject.hitbox });
      CEH.request(EVENT.REMOVE_FROM_LIST, { list: enemies, object: this });
    }
    Enemy.prototype.update = function () {

    };

    Enemy.prototype.addHP = function (hp) {
      this.health += hp;
    };
    // Enemy.prototype.render = function () {
    //   //ingame.drawAnimatedImageToWorld(this.image, undefined, this.hitbox.x, this.hitbox.y);
    // }

    eh.updateAll = function () {
      enemies.forEach(function (e) { e.update() });
    }
    // eh.renderAll = function () {
    //   enemies.forEach(function (e) { e.render() });
    // }

    return eh;
};