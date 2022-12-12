var watchify = require('watchify')
var ecstatic = require('ecstatic')
var http = require('http')

var st = ecstatic(__dirname)
var br = require('browserify')({
  entries: [__dirname + '/index.js']
})

var n = 0
var server = http.createServer(function(req, res) {
  if (req.url !== '/bundle.js') return st(req, res, function(err) {
    return res.end('404: ' + req.url)
  })


  var i = n++
  console.time('build #' + i)
  res.setHeader('Content-Type', 'application/javascript')
  br.bundle().once('end', function() {
    console.timeEnd('build #' + i)
  }).pipe(res)
})

server.listen(9966, function() {
  console.log('listening on port 9966')
})
