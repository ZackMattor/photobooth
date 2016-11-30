var BaseObject = require('./base');
var Client = require('./client');
gm = require('gm').subClass({imageMagick: true});
var fs = require('fs');
var mkdirp = require('mkdirp');

var Booth = function(faye_client, booth_id) {
  this.setNamespace(booth_id);
  this.events = {};
  this.count = 1;
  this.booth_id = booth_id;
  this.faye_client = faye_client;
  this.token_interval = null;
  this.join_tokens = [];

  this.listenForUpload();
  this.startHeartbeat();
  this.startJoinTokenGeneration();
};

Booth.prototype = BaseObject.extend({
  startJoinTokenGeneration() {
    this.token_interval = setInterval(() => {
      var token = parseInt(Math.random() * (9999-1000) + 1000);
      this.publish('/new_join_token', token);
      this.join_tokens.push(token);
      this.join_tokens = this.join_tokens.slice(-5);

      console.log(this.booth_id + ": Active join tokens");
      console.log(this.join_tokens);
    }, 5000);
  },

  disconnect() {
    console.log('disconnect callback');
    console.log(this.booth_id + ': DISCONNECTING');
    clearInterval(this.token_interval);
  },

  tokenValid(token) {
    return (this.join_tokens.indexOf(token) !== -1)
  },

  listenForUpload() {
    this.subscribe('/upload', (data) => {
      var base64Data = data.replace(/^data:image\/png;base64,/, "");
      var buf = new Buffer(base64Data, 'base64');

      var path = './images/' + this.booth_id;

      mkdirp.sync(path);

      var count = this.count;

      gm(buf, 'image.png').write(path + '/' + count + '.jpg', (err) => {
        if(err) console.log(err);

        this.client.pushImage("/images/" + this.booth_id + '/' + count + '.jpg');
      });

      this.count++;
    });
  },

  newClient(client_id) {
    console.log(this.client);
    if(this.client) this.client._disconnect();

    console.log('adding new client to booth - ' + this.booth_id);
    this.client = new Client(this.faye_client, client_id);

    console.log('THERE WE GO!');
    this.client.on('take_picture', () => {
      this.publish('/take_picture', null);
    });
    console.log('THERE WE GO!');
  }
});

module.exports = Booth;
