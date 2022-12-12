module.exports = Spawner

function Spawner(game) {
  if (!(this instanceof Spawner)) return new Spawner(game)

  var bombChance = 1
  var speed = 0.25

  var Bomb = require('../entities/bomb').tag('spawned')
  var EnemyGenerator = require('../components/enemy')
  var b2Vec2 = require('box2dweb-commonjs').Box2D.Common.Math.b2Vec2

  game.field.grid.on('created', function(chunk) {
    if (!game.ready) return

    var frequency = game.levels.frequency(game.level)
    var Enemy = EnemyGenerator(
        2.1 // size
      , game.levels.speed(game.level)
      , game.levels.health(game.level)
      , 0
    ).tag('spawned')

    var x = chunk.position[0] * chunk.shape[0]
    var y = chunk.position[1] * chunk.shape[1]
    for (var i = 0; i < frequency; i += 1) {
      var ex = Math.random() * 30
      var ey = Math.random() * 30
      if (chunk.get(ex|0, ey|0)) {
        var enemy = new Enemy
        game.add(enemy)
        enemy.body.SetPosition(new b2Vec2(x + ex, y + ey))
      }
    }

    if (Math.random() < bombChance) {
      var ex = Math.random() * 30
      var ey = Math.random() * 30
      if (chunk.get(ex|0, ey|0)) {
        var b = new Bomb
        game.add(b)
        b.body.SetPosition(new b2Vec2(x + ex, y + ey))
      }
    }
  })

  game.field.grid.on('removed', function(chunk) {
    var cx = chunk.position[0] * chunk.shape[0]
    var cy = chunk.position[1] * chunk.shape[1]
    var spawned = game.find('spawned')
    for (var i = 0; i < spawned.length; i += 1) {
      var b = spawned[i].body
      var x = b.m_xf.position.x
      var y = b.m_xf.position.y
      if (x > cx && y > cy && x < cx+30 && y < cy+30)
        spawned[i].flagged = true
    }
  })
}
