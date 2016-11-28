var BaseObject = require('./base');

var Client = function(faye_client, client_id) {
  this.events = {};
  this.faye_client = faye_client;

  this.faye_client.publish('/' + client_id + '/connected', null);

  this.faye_client.subscribe('/' + client_id + '/take_picture', () => {
    this.trigger('take_picture');
  });

  this.startHeartbeat(client_id);
};

Client.prototype = BaseObject.extend({
  disconnect() {
    this.faye_client.unsubscribe('/' + this.client_id + '/take_picture');
    this.off_all();
    this.trigger('kick');
  }
});

module.exports = Client;
