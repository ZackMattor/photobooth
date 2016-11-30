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

var Photostrip = {
  init() {
    this.count = 0;
    this.length = 4;

    this.canvas = document.getElementById('canvas');
    this.photo = document.getElementById('photo');
  },

  reset() {
    this.count = 0;

    if(this.width && this.height) {
      this.context.clearRect(0, 0, this.width, this.height*this.length);
      var data = this.canvas.toDataURL('image/png');
      this.photo.setAttribute('src', data);
    }
  },

  injestPicture(videoElement) {
    if(this.count == this.length) this.reset();

    if(!this.width && !this.height && !this.context) {
      this.width = 1280;
      this.height = videoElement.videoHeight / (videoElement.videoWidth/this.width);

      this.canvas.width = this.width;
      this.canvas.height = this.height * this.length;
      this.context = this.canvas.getContext('2d');
    }

    this.context.drawImage(videoElement, 0, this.height*this.count, this.width, this.height);

    var data = this.canvas.toDataURL('image/png');
    this.photo.setAttribute('src', data);

    this.count++;

    if(this.count == this.length) {
      var data = this.canvas.toDataURL('image/png');
      BoothClient.upload(data);
    }
  }
};

var Camera = {
  init() {
    Photostrip.init();
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
        }],
        mandatory: {
          "minWidth": "500",
          "minHeight": "500"
        }
      }
    };
    navigator.getUserMedia(constraints, this.successCallback.bind(this), this.errorCallback.bind(this));
  },

  takePicture() {
    Photostrip.injestPicture(this.videoElement);
  }
};

var BoothClient = {
  init() {
    this.faye_client = new Faye.Client(location.origin + '/faye');
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

  upload(data) {
    this.publish('upload', data).then(() => {
      Photostrip.reset();
    }, (err) => {
      alert(err);
    });
  },

  subscribe(route, cb) {
    return this.faye_client.subscribe('/' + this.booth_id + '/' + route, cb);
  },

  publish(route, data) {
    return this.faye_client.publish('/' + this.booth_id + '/' + route, data);
  },

  _newToken(token) {
    $('.join-token').html(token);
  },

  _takePicture() {
    Camera.takePicture();
  },

  _pong() {
    this.publish('pong', null);
  }
};

$(function() {
  BoothClient.init();
});