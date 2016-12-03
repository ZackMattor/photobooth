var extend = require('extend');

var BaseObject = function() {};

BaseObject.prototype = {
  baseInit(opts) {
    this.id = opts.id;
    this.faye_client = opts.faye_client;
    this.events = {};
    this.proxies = {};

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
    return this.faye_client.publish(this._fayeRoute(route), data);
  },

  subscribe(route, cb) {
    return this.faye_client.subscribe(this._fayeRoute(route), cb);
  },

  proxy(route, cb) {
    var id = this.uuid();

    this.proxies[id] = {
      route: route
    };

    this.subscribe(route, (data) => {
      this.trigger('_proxy', {
        route: route,
        data: data,
        id: id
      });
    });
  },

  _setupProxy(scope) {
    this.subscribe('/proxy_reciept', (data) => {
      console.log('GOT RECIEPTT');
      this.trigger('_proxy_reciept', data);
    });

    scope.on('_proxy', (proxy_info) => {
      if(this.proxies[proxy_info.id]) return;

      console.log(proxy_info);

      this.publish(proxy_info.route, proxy_info);
    });

    scope.on('_proxy_reciept', (proxy_info) => {
      if(!this.proxies[proxy_info.id]) return;

      proxy_info = this.proxies[proxy_info.id];

      this.publish(proxy_info.route + '_reciept', 'data');
    });
  },

  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  },

  unsubscribe(route) {
    return this.faye_client.unsubscribe(this._fayeRoute(route));
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
