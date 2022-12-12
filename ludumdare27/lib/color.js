/*
  Copyright (c) Matthew Mueller, MIT License
  http://component.io/matthewmueller/color
*/

/**
 * Lighten the given color
 * @param  {String} color hex value
 * @param  {Number} value
 * @return {String}
 */

exports.lighten = function(color, v) {
  v = (v <= 1) ? v*100 : v;
  return tint(color, v);
};

/**
 * Darken the given color
 * @param  {String} color hex value
 * @param  {Number} value
 * @return {String}
 */

exports.darken = function(color, v) {
  v = (v <= 1) ? v*100 : v;
  return tint(color, -v);
};


/**
 * Tint the color by the given value
 *
 * Credits: richard maloney 2006
 *
 * @param {String} color
 * @param {Number} v
 * @return {String}
 */

function tint(color, v) {
  color = color.replace(/^#/, '');
  color = (color.length == 3) ? hex3tohex6(color) : color;
  var rgb = parseInt(color, 16);
  var r = Math.abs(((rgb >> 16) & 0xFF)+v); if (r>255) r=r-(r-255);
  var g = Math.abs(((rgb >> 8) & 0xFF)+v); if (g>255) g=g-(g-255);
  var b = Math.abs((rgb & 0xFF)+v); if (b>255) b=b-(b-255);
  r = Number(r < 0 || isNaN(r)) ? 0 : ((r > 255) ? 255 : r).toString(16);
  if (r.length == 1) r = '0' + r;
  g = Number(g < 0 || isNaN(g)) ? 0 : ((g > 255) ? 255 : g).toString(16);
  if (g.length == 1) g = '0' + g;
  b = Number(b < 0 || isNaN(b)) ? 0 : ((b > 255) ? 255 : b).toString(16);
  if (b.length == 1) b = '0' + b;
  return "#" + r + g + b;
}

/**
 * Hex3 to Hex6
 */

function hex3tohex6(h) {
  return h[0] + h[0]
       + h[1] + h[1]
       + h[2] + h[2];
}
