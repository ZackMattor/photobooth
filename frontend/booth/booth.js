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

var Camera = {
  init() {
    this.videoElement = document.querySelector('video');
    this.videoSelect = document.querySelector('select#videoSource');

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (typeof MediaStreamTrack === 'undefined' ||
      typeof MediaStreamTrack.getSources === 'undefined') {
      alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
    } else {
      MediaStreamTrack.getSources(this.gotSources.bind(this));
    }

    this.videoSelect.onchange = this.start.bind(this);
    this.start();
  },

  gotSources(sourceInfos) {
    for (var i = 0; i !== sourceInfos.length; ++i) {
      var sourceInfo = sourceInfos[i];
      var option = document.createElement('option');
      option.value = sourceInfo.id;
      if (sourceInfo.kind === 'video') {
        option.text = sourceInfo.label || 'camera ' + (this.videoSelect.length + 1);
        this.videoSelect.appendChild(option);
      } else {
        console.log('Some other kind of source: ', sourceInfo);
      }
    }
  },

  successCallback(stream) {
    window.stream = stream; // make stream available to console
    this.videoElement.src = window.URL.createObjectURL(stream);
    this.videoElement.play();
  },

  errorCallback(error) {
    console.log('navigator.getUserMedia error: ', error);
  },

  start() {
    if (window.stream) {
      this.videoElement.src = null;
      window.stream.stop();
    }
    var videoSource = this.videoSelect.value;
    var constraints = {
      video: {
        optional: [{
          sourceId: videoSource
        }]
      }
    };
    navigator.getUserMedia(constraints, this.successCallback.bind(this), this.errorCallback.bind(this));
  },
};

var BoothClient = {
  init() {
    this.faye_client = new Faye.Client('http://localhost:8000');
    this.booth_id = Utils.uuid();

    Camera.init();
    this.setupSubscriptions();
    this.tellServerWeExist();
  },

  setupSubscriptions() {
    this.subscribe('take_picture', this._takePicture.bind(this));
    this.subscribe('new_join_token', this._newToken.bind(this));
    this.subscribe('ping', this._pong.bind(this));
  },

  tellServerWeExist() {
    this.faye_client.publish('/new_booth', this.booth_id);
  },

  subscribe(route, cb) {
    this.faye_client.subscribe('/' + this.booth_id + '/' + route, cb);
  },

  publish(route, data) {
    this.faye_client.publish('/' + this.booth_id + '/' + route, data);
  },

  _newToken(token) {
    $('.join-token').html(token);
  },

  _takePicture() {
    alert('WOWOWOWOW - TAKE PIC');
  },

  _pong() {
    console.log('pong');
    this.publish('/' + this.booth_id + '/pong', null);
  }
};

BoothClient.init();
