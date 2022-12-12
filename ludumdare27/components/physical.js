var bs = require('bindlestiff')
var game = require('../game-instance')

module.exports = bs.component('physical')
  .needs('attached')
  .on('init', function() {
    this.world = this.game.world
  })
