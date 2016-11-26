var express = require('express');
var http    = require('http');
var faye    = require('faye');
var BoothManager = require('./backend/booth_manager');

var app = express();

app.use('/booth', express.static('frontend/booth'));
app.use('/', express.static('frontend/client'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

var server = http.createServer();
var bayeux = new faye.NodeAdapter({mount: '/'});

bayeux.attach(server);
server.listen(8000);

BoothManager.init(bayeux.getClient());
