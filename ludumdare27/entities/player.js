var Box2D = require('box2dweb-commonjs').Box2D
var b2Player = require('box2d-player')(Box2D)
var lighten = require('../lib/color').lighten
var bs = require('bindlestiff')

var Bullet = require('./player-bullet')

var tau = Math.PI * 2
var round = Math.round
var abs = Math.abs
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef
var b2BodyDef = Box2D.Dynamics.b2BodyDef
var b2Vec2 = Box2D.Common.Math.b2Vec2
var b2Body = Box2D.Dynamics.b2Body
var tempPosition = [0,0]

var player = bs.component([
    'player'
  , 'body'
])
  .needs('physical')
  .needs('attached')
  .needs('controllable')
  .on('init', function() {
    var x = this.game.width / 60
    var y = this.game.height / 60

    var def = new b2BodyDef
    def.position = new b2Vec2(20, 0)
    def.type = b2Body.b2_dynamicBody
    def.userData = {}
    def.fixedRotation = true

    this.flinch = 0
    this.body = this.world.CreateBody(def)
    this.rotation = 0
    this.rotating = false
    this.lastangle = 1
    this.pop = 0

    var fixdef = new b2FixtureDef
    fixdef.shape = new b2CircleShape(0.49)

    this.fixture = this.body.CreateFixture(fixdef)

    this.b2p = new b2Player(this.world, {
        body: this.body
      , fixture: this.fixture
      , jumpHeight: 25
    })

    this.b2Pos = this.body.m_xf.position

    ;[-1, 1].forEach(function(dir) {
      this.left = this.b2p.createSensor([
          [-0.65, -0.40]
        , [-0.48, -0.40]
        , [-0.48, -0.45]
        , [-0.65, -0.45]
      ])
      this.right = this.b2p.createSensor([
          [+0.65, -0.40]
        , [+0.48, -0.40]
        , [+0.48, -0.45]
        , [+0.65, -0.45]
      ])
    }.bind(this))

    var self = this
    this.blockedLeft = 0
    this.blockedRight = 0
    this.left.on('begin',  function() { self.blockedLeft += 1 })
    this.right.on('begin', function() { self.blockedRight += 1 })
    this.left.on('end',    function() { self.blockedLeft -= 1 })
    this.right.on('end',   function() { self.blockedRight -= 1 })

    this.shootTimer = 0
  })
  .on('tick', function() {
    this.body.SetActive(true)
    this.body.SetAwake(true)
    this.health = this.health < 0 ? 0
      : (this.health < 15 ? this.health : 15)

    var xspd = this.body.m_linearVelocity.x =
        this.controls.left  && !this.blockedLeft  ? -14
      : this.controls.right && !this.blockedRight ? +14
      : 0

    this.game.ready = this.game.ready || xspd
    this.pop *= 0.95
    this.flinch *= 0.97

    if (this.rotating) {
      this.rotation += xspd > 0
        ? +0.18
        :  xspd < 0
        ? -0.18
        : this.lastangle > 0
        ? +0.18
        : -0.18
      this.lastangle = xspd || this.lastangle
    } else {
      this.rotation = 0
    }

    if (this.shootTimer > 0) {
      this.shootTimer -= 1
    } else
    if (this.controls.shoot) {
      this.fireBullet()
    }

    if (this.controls.jump && this.b2p.jump()) {
      this.pop += 8
    }
    this.rotating = ((abs(this.body.m_linearVelocity.y)) > 0.2)

    tempPosition[0] = round(this.b2Pos.x)
    tempPosition[1] = round(this.b2Pos.y)
    this.pop = this.pop > 8 ? 8 : this.pop
    this.game.field.move(tempPosition)
  })
  .on('draw', function(ctx, game) {
    var x = this.b2p.body.m_xf.position.x * 30 - game.camera.pos[0]
    var y = this.b2p.body.m_xf.position.y * 30 - game.camera.pos[1]
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(this.rotation)
    ctx.fillStyle = lighten('#362F34', (this.flinch * 200)|0)
    ctx.fillRect(
        -15 - this.pop
      , -15 - this.pop
      ,  30 + this.pop * 2
      ,  30 + this.pop * 2
    )
    ctx.restore()
  })
  .on('damaged', function(damage) {
    this.flinch = 1
    if (this.health < 1) this.game.restart()
  })

module.exports = bs.define()
  .use(require('../components/attached'))
  .use(require('../components/physical'))
  .use(require('../components/controllable'))
  .use(require('../components/health')(15))
  .use(player)
  .use(require('../components/vulnerable')(0))
  .use(require('../components/gravity'))

module.exports.prototype.fireBullet = function() {
  this.shootTimer = 8
  var bullet = new Bullet
  var tx = this.game.mouse.x - (this.body.m_xf.position.x * 30 - this.game.camera.pos[0])
  var ty = this.game.mouse.y - (this.body.m_xf.position.y * 30 - this.game.camera.pos[1])
  var a = Math.atan2(ty, tx)
  var rx = Math.cos(a)
  var ry = Math.sin(a)

  bullet.body.SetPosition(new b2Vec2(
      this.body.m_xf.position.x + rx * 0.5
    , this.body.m_xf.position.y + ry * 0.5
  ))

  bullet.body.ApplyImpulse({
      x: rx * 35 + this.body.m_linearVelocity.x
    , y: ry * 35 + this.body.m_linearVelocity.y
  }, bullet.body.GetWorldCenter())

  this.game.enqueue(bullet)
}
