var extend = require('extend');

var BaseObject = function() { };

BaseObject.prototype = {
  baseInit(opts) {
    this.id = opts.id;
    this.faye_client = opts.faye_client;
    this.events = {};

    this.startHeartbeat();
  },

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

  startHeartbeat() {
    var count = 0;

    this.subscribe('/pong', () => {
      count = 0;
    });

    this.heartbeat_interval = setInterval(() => {
      this.publish('/ping', null);
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

  publish(route, data) {
    this.faye_client.publish(this._fayeRoute(route), data);
  },

  subscribe(route, cb) {
    this.faye_client.subscribe(this._fayeRoute(route), cb);
  },

  unsubscribe(route) {
    this.faye_client.unsubscribe(this._fayeRoute(route));
  },

  _fayeRoute(route) {
    if(!this.id) console.error('NO ID SET');

    return '/' + this.id + route;
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
