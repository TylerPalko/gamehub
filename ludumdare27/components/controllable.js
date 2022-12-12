var bs = require('bindlestiff')

var controls = require('kb-controls')({
    '<left>': 'left'
  , 'A': 'left'

  , 'D': 'right'
  , '<right>': 'right'

  , 'W': 'jump'
  , 'Z': 'jump'
  , '<up>': 'jump'
  , '<space>': 'jump'

  , '<mouse 1>': 'shoot'
  , '<shift>': 'shoot'
  , 'X': 'shoot'
})

module.exports = bs.component('controllable')
  .on('init', function() {
    this.controlling = true
    this.controls = controls
  })
