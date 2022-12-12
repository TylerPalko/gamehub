var bs = require('bindlestiff')

module.exports = bs.component()
  .needs('attached')
  .needs('body')
  .on('tick', function() {
    this.body.ApplyImpulse(this.game.gravity, this.body.m_sweep.c)
  })
