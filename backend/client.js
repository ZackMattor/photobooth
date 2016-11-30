var BaseObject = require('./base');

var Client = function(faye_client, client_id) {
  this.baseInit({
    id: client_id,
    faye_client: faye_client
  });

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
