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

client.subscribe('/' + client_id + '/ping', function(message) {
  console.log('pong');
  client.publish('/' + client_id + '/pong', null);
});

client.subscribe('/' + client_id + '/kick', function(message) {
  alert('Someone else took over...');
});

client.subscribe('/' + client_id + '/connected', function(message) {
  $('.state-1').hide();
  $('.state-2').show();
});

$(function() {
  $('.submit').click(() => {
    client.publish('/new_client', {
      join_token: $('.join-token').val(),
      client_id: client_id,
    });
  });

  $('.take-picture').click(() => {
    console.log('take pic');
    client.publish('/' + client_id + '/take_picture', 1);
  });
});
