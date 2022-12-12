var bs = require('bindlestiff')

module.exports = explosive

function explosive(force) {
  var Bullet = require('../entities/player-bullet')
  var Box2D = require('box2dweb-commonjs').Box2D
  var b2Vec2 = Box2D.Common.Math.b2Vec2
  var tau = Math.PI * 2

  return bs.component('explosive')
    .needs('attached')
    .needs('physical')
    .needs('body')
    .on('explode', function() {
      if (this.flagged) return
      this.flagged = true
      this.game.flash = 1

      var bodies = this.game.find('body')
      var tx = this.body.m_xf.position.x
      var ty = this.body.m_xf.position.y
      var center = this.body.m_sweep.c
      var tempVec = {x:0,y:0}

      for (var i = 0; i < bodies.length; i += 1) {
        var b = bodies[i]
        var p = b.body.m_xf.position
        var dy = p.y - ty
        var dx = p.x - tx
        if (Math.abs(dy) + Math.abs(dx) < 20) {
          var a = Math.atan2(dy, dx)
          tempVec.x = Math.cos(a) * 40
          tempVec.y = Math.sin(a) * 40
          b.body.ApplyImpulse(tempVec, center)
          if (b !== this.game.player) {
            b.trigger('damaged', 3)
          } else {
            b.health += 2
          }
        }
      }

      this.game.next(function() {
        for (var i = 0; i < 1; i += 0.05) {
          var bullet = new Bullet
          var dx = Math.cos(i * tau)
          var dy = Math.sin(i * tau)
          bullet.body.SetPosition(new b2Vec2(
              tx + dx * 0.75
            , ty + dy * 0.75
          ))
          bullet.body.ApplyImpulse({
              x: dx * 50
            , y: dy * 50
          }, center)
          this.add(bullet)
        }
      })
    })
}
