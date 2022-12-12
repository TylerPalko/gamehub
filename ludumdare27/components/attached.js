var game = require('../game-instance')
var bs = require('bindlestiff')

module.exports = bs.component('attached')
  .on('init', function() {
    this.game = game
  })
