var BaseObject = require('./base');

var Client = function(faye_client, client_id) {
  this.setNamespace(client_id);
  this.events = {};
  this.faye_client = faye_client;
  this.client_id = client_id;

  this.publish('/connected', null);

  this.subscribe('/take_picture', () => {
    this.trigger('take_picture');
  });

  this.startHeartbeat();
};

Client.prototype = BaseObject.extend({
  disconnect() {
    this.unsubscribe('/take_picture');
    this.off_all();
    this.trigger('kick');
  },

  pushImage(url) {
    console.log('PUSHING IMAGE: ' + url);
    this.publish('/picture', url);
  }
});

module.exports = Client;
