var MyMath = {
  dot: function (v1x, v1y, v2x, v2y) {
    return v1x * v2x + v1y * v2y;
  },
  rotate90: function (x, y) {
    return { x: y, y: -x };
  },
  setContextColor: function (hexString) {
    C.bufferCC.fillStyle = hexString;
  },
  vectorFromTo: function (v1x, v1y, v2x, v2y) {
    return new Vec2(v2x - v1x, v2y - v1y);
  },
  intersectRect: function (rect1, rect2) {
    return (rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.height + rect1.y > rect2.y)
  },
  rgbToHex: function (r, g, b) {
    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }
    return ("#" + componentToHex(r) + componentToHex(g) + componentToHex(b)).toUpperCase();
  },

  random: function (min, max) {
    return (min + (Math.random() * (max - min)));
  },

  randomInt: function (min, max) {
    return Math.round(this.random(min, max));
  },

  randomChoice: function (choices) {
    return choices[this.randomInt(0, choices.length - 1)];
  },

  randomBool: function () {
    return this.randomChoice([true, false]);
  },

  limit: function (x, min, max) {
    return Math.max(min, Math.min(max, x));
  },

  between: function (n, min, max) {
    return ((n >= min) && (n <= max));
  },

  accelerate: function (v, accel, dt) {
    return v + (accel * dt);
  },

  lerp: function (n, dn, dt) {   // linear interpolation
    return n + (dn * dt);
  },
  interpolate: function (a, b, percent) { return a + (b - a) * percent },
  easeIn: function (a, b, percent) { return a + (b - a) * Math.pow(percent, 2); },
  easeOut: function (a, b, percent) { return a + (b - a) * (1 - Math.pow(1 - percent, 2)); },
  easeInOut: function (a, b, percent) { return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5); },

  darken: function (hex, percent) {
    return this.brighten(hex, -percent);
  },
}
export {MyMath};