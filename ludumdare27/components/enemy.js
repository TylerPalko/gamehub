var Box2D = require('box2dweb-commonjs').Box2D
var lighten = require('../lib/color').lighten
var bs = require('bindlestiff')

var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef
var b2BodyDef = Box2D.Dynamics.b2BodyDef
var b2Vec2 = Box2D.Common.Math.b2Vec2
var b2Body = Box2D.Dynamics.b2Body

var shootme = new Image
shootme.src = 'img/shoot-me.png'

module.exports = function(
    size
  , speed
  , health
  , style
) {
  var Pellet = require('../entities/pellet')('#EB3E38')
  var tau = Math.PI * 2

  return bs.define()
    .tag('enemy')
    .use(require('../components/attached'))
    .use(require('../components/physical'))
    .use(require('../components/health')(health))
    .use(bs.component()
      .on('init', function() {
        this.base_r =
        this.r = size * 15 * (Math.random() * 0.25 + 0.75)
        this.c = '#EB3E38'
        this.flinch = 0
        this.st = 0
      })
      .on('tick', function() {
        this.flinch *= 0.95
        this.st += 1
        if (this.flinch)
        if (this.flinch < 0.0025) {
          this.flinch = 0
          this.c = '#EB3E38'
          this.r = this.base_r
        } else {
          this.c = lighten('#EB3E38', (this.flinch * 200)|0)
          this.r = this.base_r * (1 - this.flinch * 0.4)
        }
      })
      .on('draw', function(ctx) {
        if (this.game.labels) {
          ctx.globalAlpha = this.game.labels
          ctx.drawImage(shootme
            , this.body.m_xf.position.x * 30 - this.game.camera.pos[0] - 50
            , this.body.m_xf.position.y * 30 - this.game.camera.pos[1] - 75 - Math.sin(this.st / 6) * 10
          )
          ctx.globalAlpha = 1
        }
      })
      .on('damaged', function(dmg) {
        this.flinch = 1
        this.game.score += dmg * 100 * this.game.level
      })
      .on('damaging', function() {
        var self = this
        this.game.next(function() {
          self.trigger('died')
        })
      })
      .on('died', function() {
        if (this.flagged) return
        this.flagged = true

        this.game.shot++

        if (this.game.labels)
        if (this.game.shot > 5) {
          this.game.labels *= 0.99
        }

        var tx = this.body.m_xf.position.x
        var ty = this.body.m_xf.position.y
        var center = this.body.m_sweep.c
        var tempVec = {x:0,y:0}

        this.game.next(function() {
          for (var j = 1; j <= 3; j += 1)
          for (var i = 0; i < 1; i += 0.34) {
            var bullet = new Pellet
            var dx = Math.cos(i * tau)
            var dy = Math.sin(i * tau)
            bullet.body.SetPosition(new b2Vec2(
                tx + dx * 0.5 * (j / 2 - 1)
              , ty + dy * 0.5 * (j / 2 - 1)
            ))
            bullet.body.ApplyImpulse({
                x: dx * 10
              , y: dy * 10
            }, center)

            this.add(bullet)
          }
        })
      })
    )
    .use(require('../components/body')(
      function createBody() {
        var bd = new b2BodyDef
        bd.position = new b2Vec2(Math.random()*5, Math.random()*5-5)
        bd.type = b2Body.b2_dynamicBody
        bd.userData = {}
        bd.fixedRotation = false
        bd.m_linearDamping = 1
        return bd
      },
      function createFixture() {
        var fd = new b2FixtureDef
        fd.restitution = 0.5
        fd.shape = new b2CircleShape(0.5 * this.r / 15)
        return fd
      }
    ))
    .use(require('../components/harmful')(0, 1))
    .use(require('../components/target-player')(speed))
    .use(require('../components/vulnerable')(1))
    .use(shapes)

  function shapes(def) {
    return require('../components/draw-circle')()(def)
  }
}
