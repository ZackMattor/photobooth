var Booth = require('./booth');

module.exports = {
  faye_client: null,
  booths: [],

  init(faye_client) {
    this.faye_client = faye_client;

    this.faye_client.subscribe('/new_booth', this.createBooth.bind(this));
    this.faye_client.subscribe('/new_client', this.createClient.bind(this));
  },

  createBooth(booth_id) {
    var booth = new Booth(this.faye_client, booth_id);
    booth.on('disconnect', this.onBoothDisconnect.bind(this));
    this.booths.push(booth);

    console.log('#' + this.booths.length + "(" + booth_id + ") is connecting!");
  },

  onBoothDisconnect(booth) {
    var index = this.booths.indexOf(booth);
    console.log(index);

    if(index != -1) {
      this.booths.splice(index, 1);
    } else {
      console.log('CANT DISCONNECT CLIENT!!!?!?!?');
    }
  },

  createClient(data) {
    var client_id = data.client_id;
    var join_token = parseInt(data.join_token);

    console.log('Someone is trying to join....');

    this.booths.forEach((booth) => {
      if(booth.tokenValid(join_token)) {
        booth.newClient(client_id);
      }
    });
  }
};
