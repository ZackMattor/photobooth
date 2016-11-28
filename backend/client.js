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
    console.log('wat');
    this.faye_client.unsubscribe('/' + client_id + '/take_picture');
    console.log('foo');
    this.off_all();
    console.log('bar');
    this.trigger('kick');
  }
});

module.exports = Client;
