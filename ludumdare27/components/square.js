var physical = require('./physical')
var Box2D = require('box2dweb-commonjs').Box2D

module.exports = square

function square(world, size) {
  return physical(world
    , function body() {

    }
    , function fixture() {

    }
  )
}
