var Box2D = require('box2dweb-commonjs')
var bs = require('bindlestiff')

module.exports = createBody

function createBody(body, fixture) {
  return bs.component('body')
    .needs('attached')
    .needs('physical')
    .on('init', function() {
      this.body = this.world.CreateBody(body.call(this, this.world))
      this.fixture = this.body.CreateFixture(fixture.call(this, this.body, this.world))
    })
    .on('destroy', function() {
      this.body.DestroyFixture(this.fixture)
      this.world.DestroyBody(this.body)
      this.game.remove(this)
      delete this.body
      delete this.world
      delete this.game
    })
}
