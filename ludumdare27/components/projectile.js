var Box2D = require('box2dweb-commonjs').Box2D
var bs = require('bindlestiff')
var b2e = require('box2d-events')

module.exports = function projectile(options) {
  options = options || {}
  var key = options.key || 'shooter'

  return bs.component('projectile')
    .needs('attached')
    .needs('physical')
    .on('init', function() {
      var self = this
      this.counter = 10
      b2e(Box2D, this.game.world).fixture(
        this.fixture
      ).on('begin', function() {
        if (!--self.counter) self.flagged = true
      })
    })
}
