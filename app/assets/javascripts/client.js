var Utils = {
  randomNumber() {
    return parseInt(Math.random() * (9999-1000) + 1000);
  },

  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  },

  publishWithReciept(route, data) {
    return new Promise((resolve) => {
      console.log('sub to '+ route + '_reciept');
      client.subscribe(route + '_reciept', () => {
        $('.take-picture').removeClass('disabled');

        resolve();
      });

      client.publish(route, data)
    });
  }
};

var client = new Faye.Client(location.origin + '/faye');
var client_id = Utils.uuid();

client.subscribe('/' + client_id + '/ping', function(message) {
  console.log('pong');
  client.publish('/' + client_id + '/pong', null);
});

client.subscribe('/' + client_id + '/kick', function(message) {
  alert('Someone else took over...');
});

client.subscribe('/' + client_id + '/picture', function(url) {
  $('.photostrip-preview').show();
  $('.photostrip-preview img').attr('src', url);
  $('.photostrip-preview a').attr('href', url);
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

  $('.take-picture').click((e) => {
    if($(e.currentTarget).hasClass('disabled')) return;

    $(e.currentTarget).addClass('disabled');
    Utils.publishWithReciept('/' + client_id + '/take_picture', 1).then();
  });
});
