var extend = require('extend');

var BaseObject = {
  on(event_name, callback) {
    if(!this._populated(event_name)) this.events[event_name] = [];

    this.events[event_name].push(callback);
  },

  off(event_name, callback) {
    if(!this._populated(event_name)) return;

    if(callback) {
      var index = this.events[event_name].indexOf(callback);

      this.events[event_name].splice(index, 1);
    } else {
      this.events[event_name] = [];
    }
  },

  off_all() {
    this.events = {};
  },

  startHeartbeat(id) {
    var count = 0;

    this.faye_client.subscribe('/' + id + '/pong', () => {
      count = 0;
    });

    this.heartbeat_interval = setInterval(() => {
      this.faye_client.publish('/' + id + '/ping', null);
      count++;

      if(count > 5) { this.disconnect(); }
    }, 500);
  },

  trigger(event_name, data) {
    console.log(this.events);
    if(!this._populated(event_name)) return;

    this.events[event_name].forEach((callback) => {
      callback(data);
    });
  },

  _populated(event_name) {
    return Array.isArray(this.events[event_name]);
  }
};

module.exports = {
  extend(obj) {
    return extend(false, BaseObject, obj);
  }
};
