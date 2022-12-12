var bs = require('bindlestiff')

module.exports = health

function health(amount) {
  return bs.component('health')
    .on('init', function() {
      this.health = amount
      this.dead = false
    })
    .on('damaged', function(dmg) {
      this.health -= dmg
      if (!this.dead && this.health <= 0) {
        this.dead = true
        this.trigger('died')
      }
    })
}
