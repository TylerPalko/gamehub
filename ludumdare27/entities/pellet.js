var Box2D = require('box2dweb-commonjs').Box2D
var bs = require('bindlestiff')

var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef
var b2BodyDef = Box2D.Dynamics.b2BodyDef
var b2Vec2 = Box2D.Common.Math.b2Vec2
var b2Body = Box2D.Dynamics.b2Body


module.exports = pellet

var pelletCounter = 0
function pellet(c) {
  var pelletMax = 40

  return bs.define()
    .use(require('../components/attached'))
    .use(require('../components/physical'))
    .use(require('../components/body')(
      function createBody() {
        var bd = new b2BodyDef
        bd.position = new b2Vec2(0, -5)
        bd.type = b2Body.b2_dynamicBody
        bd.userData = {}
        bd.fixedRotation = true
        return bd
      },
      function createFixture() {
        var fd = new b2FixtureDef
        fd.restitution = 0.5
        fd.shape = new b2CircleShape(0.5/3)
        this.r = 5
        return fd
      }
    ))
    .use(require('../components/bounce-burst'))
    .use(bs.component()
      .on('init', function() {
        pelletCounter += 1
        if (pelletCounter > pelletMax) this.flagged = true
        this.c = c
        this.t = 140 - ((Math.random() * 40)|0)
      })
      .on('tick', function() {
        this.t -= 1
        if (!this.t) this.flagged = true
      })
      .on('destroy', function() {
        pelletCounter -= 1
      })
    )
    .use(require('../components/draw-circle')(5))
    .use(require('../components/gravity'))
}
