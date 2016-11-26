var Utils = {
  randomNumber() {
    return parseInt(Math.random() * (9999-1000) + 1000);
  },

  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  }
};

var client = new Faye.Client('http://localhost:8000');
var client_id = Utils.uuid();

client.publish('/new_booth', client_id);

client.subscribe('/' + client_id + '/ping', function(message) {
  console.log('pong');
  client.publish('/' + client_id + '/pong', null);
});

client.subscribe('/' + client_id + '/take_picture', function(message) {
  alert('WOWOWOWOW - TAKE PIC');
});

client.subscribe('/' + client_id + '/new_join_token', function(message) {
  $('.join-token').html(message);
});
