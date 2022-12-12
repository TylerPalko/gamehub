var lerp = require('vectors/lerp')(2)
var round = Math.round

module.exports = Camera

function Camera(game, field) {
  if (!(this instanceof Camera)) return new Camera(game, field)

  this.game = game
  this.field = field
  this.shape = this.field.grid.shape
  this.pos = [this.game.width / 2, this.game.height / 2]
  this.target = this.pos.slice(0)
}

Camera.prototype.draw = function() {
  this.target[0] = this.game.player.b2Pos.x * 30 - this.game.width / 2
  this.target[1] = this.game.player.b2Pos.y * 30 - this.game.height / 2
  if (!this.game.ready) {
    this.target[1] -= this.game.width * 0.2
  }
  lerp(this.pos, this.pos, this.target, this.game.ready ? 0.05 : 1)
}

Camera.prototype.tick = function() {

}
