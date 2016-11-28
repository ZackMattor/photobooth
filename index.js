var express = require('express');
var http    = require('http');
var faye    = require('faye');
var BoothManager = require('./backend/booth_manager');

var app = express();
var server = http.createServer(app);
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

bayeux.attach(server);

app.use('/booth', express.static('frontend/booth'));
app.use('/images', express.static('images'));
app.use('/', express.static('frontend/client'));

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500);
});

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

BoothManager.init(bayeux.getClient());
