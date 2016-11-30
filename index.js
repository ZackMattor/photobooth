var express = require('express');
var exphbs  = require('express-handlebars');
var http    = require('http');
var faye    = require('faye');
var BoothManager = require('./backend/booth_manager');

var xps = express();

xps.engine('handlebars', exphbs({
  defaultLayout: 'main',
  layoutsDir: 'app/views/layouts'
}));
xps.set('view engine', 'handlebars');
xps.set('views', __dirname + '/app/views/');

console.log(__dirname);

xps.use('/assets', express.static('app/assets'));
xps.use('/images', express.static('images'));

xps.get('/', function(req, res) {
  res.render('client');
});

xps.get('/booth', function(req, res) {
  res.render('booth');
});

xps.use(function(err, req, res, next){
  console.error(err.stack);
  res.send(500);
});

var server = http.createServer(xps);
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

bayeux.attach(server);

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

BoothManager.init(bayeux.getClient());
