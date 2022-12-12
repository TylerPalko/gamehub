var b2Vec2 = require('box2dweb-commonjs').Box2D.Common.Math.b2Vec2
var bs = require('bindlestiff')

module.exports = targetPlayer

function targetPlayer(speed) {
  var tempVec = new b2Vec2
  return bs.component('target-player')
    .needs('attached')
    .needs('body')
    .on('tick', function() {
      var tx = this.game.player.body.m_xf.position.x
      var ty = this.game.player.body.m_xf.position.y
      var cx = this.body.m_xf.position.x
      var cy = this.body.m_xf.position.y
      var a = Math.atan2(ty - cy, tx - cx)
      tempVec.x = Math.cos(a) * speed + Math.random() * 0.1 - 0.05
      tempVec.y = Math.sin(a) * speed + Math.random() * 0.1 - 0.05
      this.body.ApplyImpulse(tempVec, this.body.GetWorldCenter())
    })
}
