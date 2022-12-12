var Box2D = require('box2dweb-commonjs').Box2D
var b2e = require('box2d-events')
var bs = require('bindlestiff')

module.exports = function vulnerable(group) {
  group = parseInt(group, 10)

  return bs.component('vulnerable')
    .needs('physical')
    .needs('body')
    .on('init', function() {
      var self = this

      this.body.m_userData = this.body.m_userData || {}
      this.body.m_userData.vulnerable_group = group
      this.body.m_userData.parent = this
      b2e(Box2D, this.world).fixture(
        this.fixture
      ).on('begin', function(a, b) {
        var data = a.m_body.m_userData
        if (data.harmful_group === group) {
          self.trigger('damaged', data.harmful_damage)
          a.m_body.m_userData.parent.trigger('damaging', data.harmful_damage)
        }
      })
    })
}
