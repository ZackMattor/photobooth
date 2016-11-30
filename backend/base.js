var extend = require('extend');

var BaseObject = function() {};

BaseObject.prototype = {
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

      if(count > 5) { this._disconnect(); }
    }, 500);
  },

  trigger(event_name, data) {
    console.log(this.events);
    if(!this._populated(event_name)) return;

    this.events[event_name].forEach((callback) => {
      callback(data);
    });
  },

  setNamespace(namespace) {
    this.faye_namespace = namespace;
  },

  publish(route, data) {
    if(!this.faye_namepsace) console.error('NO NAMESPACE SET');
  },

  subscribe(route, cb) {
    if(!this.faye_namepsace) console.error('NO NAMESPACE SET');
  },

  _populated(event_name) {
    return Array.isArray(this.events[event_name]);
  },

  _disconnect() {
    this.trigger('disconnect', this);
    clearInterval(this.heartbeat_interval);
    this.disconnect();
  }
};

module.exports = {
  extend(obj) {
    return extend(false, new BaseObject(), obj);
  }
};
