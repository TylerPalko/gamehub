var bs = require('bindlestiff')

module.exports = function drawCircle(r, c) {
  var tau = Math.PI * 2

  this.c = this.c || c
  this.r = this.r || (+r|0) || 15

  return bs.component()
    .needs('attached')
    .needs('body')
    .on('draw', function(ctx) {
      ctx.fillStyle = this.c
      ctx.beginPath()
      ctx.arc(
          this.body.m_xf.position.x * 30 - this.game.camera.pos[0]
        , this.body.m_xf.position.y * 30 - this.game.camera.pos[1]
        , this.r
        , 0
        , tau
        , true
      )
      ctx.closePath()
      ctx.fill()
    })
}
