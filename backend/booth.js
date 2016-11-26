var BaseObject = require('./base');
var Client = require('./client');

var Booth = function(faye_client, booth_id) {
  this.events = {};
  this.booth_id = booth_id;
  this.faye_client = faye_client;
  this.heartbeat_interval = null;
  this.token_interval = null;
  this.join_tokens = [];

  this.startHeartbeat(booth_id);
  this.startJoinTokenGeneration();
};

Booth.prototype = BaseObject.extend({
  startJoinTokenGeneration() {
    this.token_interval = setInterval(() => {
      var token = parseInt(Math.random() * (9999-1000) + 1000);
      this.faye_client.publish('/' + this.booth_id + '/new_join_token', token);
      this.join_tokens.push(token);
      this.join_tokens = this.join_tokens.slice(-5);

      console.log(this.booth_id + ": Active join tokens");
      console.log(this.join_tokens);
    }, 5000);
  },

  disconnect() {
    console.log(this.booth_id + ': DISCONNECTING');
    clearInterval(this.heartbeat_interval);
    clearInterval(this.token_interval);

    this.trigger('disconnect', this);
  },

  tokenValid(token) {
    return (this.join_tokens.indexOf(token) !== -1)
  },

  newClient(client_id) {
    console.log(this.client);
    if(this.client) this.client.disconnect();

    console.log('adding new client to booth - ' + this.booth_id);
    this.client = new Client(this.faye_client, client_id);

    this.client.on('take_picture', () => {
      this.faye_client.publish('/' + this.booth_id + '/take_picture', null);
    });
  }
});

module.exports = Booth;
