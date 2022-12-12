var perlin = require('perlin').noise.perlin2
var continuous = require('ndarray-continuous')
var observer = require('continuous-observer')
var cb2d = require('continuous-box2d')(require('box2dweb-commonjs').Box2D)
var cave = require('cave-automata-2d')
var fill = require('ndarray-fill')
var pool = require('object-pool')
var zero = require('zeros')

module.exports = Field

var perlinDensity = -0.35
var perlinScale = 0.075
var caveDensity = 0.505
var caveopts = { density: caveDensity }

function Field(game) {
  if (!(this instanceof Field)) return new Field(game)

  var self = this
  var shape = [32, 32]
  var getCanvas = this.gridCache = pool({
      enable:  function(c) { c.active = true }
    , disable: function(c) { c.active = false }
    , init: function init() {
      var canvas = document.createElement('canvas')
      return {
          canvas: canvas
        , width: canvas.width = 30 * shape[0]
        , height: canvas.height = 30 * shape[1]
        , ctx: canvas.getContext('2d')
      }
    }
  })

  this.game = game
  this.grid = continuous({
      shape: shape
    , getter: function(position, done) {
      var shape = this.shape
      var ndarray
      return done(null,
        fill(
            ndarray = cave(zero(shape), caveopts)(10)
          , !(position[0] || position[1]) ? function(x, y) {
            var val = ndarray.get(x, y)
            if (y > 8) return (val ? (
              perlin(
                    (position[0] * shape[0] + x) * perlinScale
                  , (position[1] * shape[1] + y) * perlinScale
              ) > perlinDensity ? 1 : 0
            ) : val)
            return (y === 8) ? 0 : 1
          } : function(x, y) {
            var val = ndarray.get(x, y)
            return val ? (
              perlin(
                    (position[0] * shape[0] + x) * perlinScale
                  , (position[1] * shape[1] + y) * perlinScale
              ) > perlinDensity ? 1 : 0
            ) : val
          })
      )
    }
  })

  var canvases = {}
  this.grid.on('created', function(chunk) {
    var key = chunk.position.join(',')
    if (canvases[key]) getCanvas.remove(canvases[key])
    canvases[key] = getCanvas.create()
    canvases[key].position = [chunk.position[0], chunk.position[1]]
    renderChunk(chunk, canvases[key].ctx)
  })
  this.grid.on('removed', function(chunk) {
    var key = chunk.position.join(',')
    if (canvases[key]) getCanvas.remove(canvases[key])
    delete canvases[key]
  })

  this.move = observer(this.grid)

  cb2d(this.game.world, this.grid, {
    data: function(_, pos) {
      return {
          type: 'wall'
        , pos: pos
      }
    }
  })

  function renderChunk(chunk, ctx) {
    ctx.fillStyle = '#EDB53B'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#362F34'
    for (var x = 0; x < chunk.shape[0]; x += 1)
    for (var y = 0; y < chunk.shape[1]; y += 1) {
      if (!chunk.get(x, y)) {
        ctx.fillRect(x * 30, y * 30, 30, 30)
      }
    }
  }
}

