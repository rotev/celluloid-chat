define(function(require, exports, module) {

  // Dependencies
  var $         = require('jquery'),
      _         = require('underscore'),
      lil       = require('lil-uuid'),
      EventBus  = require('event_bus');

  // Local variables
  var IO,
      instance  = null; // ensure a single instance

  // Socket ready states
  var CONNECTING = 0,
      OPEN       = 1,
      CLOSING    = 2,
      CLOSED     = 3;


  IO = (function() {
    function IO() {
      if (!instance) instance = this;

      this.eventBus = new EventBus();

      _.bindAll(this, 'onMessage', 'getSocket');

      // ensure a single instance of the IO class.
      return instance;
    }

    IO.prototype.socket = null;

    IO.prototype.responseListeners = {};

    IO.prototype.getSocket = function() {
      // If a connection exists and its state is OPEN, return it.
      // otherwise, return a rejected promise.
      if (this.socket) {
        if (this.socket.readyState == OPEN) {
          return $.Deferred().resolve(this.socket).promise();
        } else {
          return $.Deferred().reject().promise();
        }
      }

      // Create a web socket connection to the server and return its promise.
      return this.createSocket();
    };

    IO.prototype.createSocket = function() {
      var defer = $.Deferred(),
          SocketKlass = "MozWebSocket" in window ? MozWebSocket : WebSocket,
          _this = this,
          ws = null;

      ws = new SocketKlass('ws://' + window.location.host + '/sync');

      ws.onerror = function(event) {
        _this.eventBus.trigger('offline');
        defer.reject();
      };

      ws.onclose = function(event) {
        _this.eventBus.trigger('offline');
        defer.reject();
      };

      ws.onopen = function(event) {
        _this.eventBus.trigger('online');
        _this.socket = ws;
        defer.resolve(_this.socket);
      };

      ws.onmessage = this.onMessage;

      return defer.promise();
    };

    // Send payload to the server. Keep track of request_id and resolve when the server
    // returns an answer for the same request, or if the connection fails.
    IO.prototype.send = function(data) {

      var requestId   = lil.uuid(),
          defer       = $.Deferred(),
          _this       = this;

      // construct message with request-response protocol.
      var payload = {
        protocol: 'request-response',
        requestId: requestId,
        data: data
      };

      this.getSocket().then(
        function success(socket) {
          // wait for response.
          _this.onceResponse(requestId, function(response) {
            var resolveOrReject = response.status === "ok" ? defer.resolve : defer.reject;
            resolveOrReject(response.data, response.status)
          });

          // send payload.
          socket.send(JSON.stringify(payload));
        },

        function fail() {
          defer.reject();
        }
      );
      
      return defer.promise();
    };

    IO.prototype.onceResponse = function(requestId, callback) {
      if (!this.responseListeners[requestId]) {
        this.responseListeners[requestId] = [];
      }
      this.responseListeners[requestId].push(callback);
    };

    IO.prototype.onMessage = function(msg) {
      var payload = JSON.parse(msg.data),
          data = payload.data,
          html = null;

      // is this a response message?
      var responseId = payload.responseId;
      if (responseId) {
        if (this.responseListeners[responseId]) {
          _.each(this.responseListeners[responseId], function(listener) {
            listener(payload);
          });
          delete this.responseListeners[responseId];
        }
        return;
      }

      // for other types of messages, trigger relevant events on the EventBus.
      // currently only model creation is supported.
      // note: model url is used as an identifier for the model type.
      if (payload.method === "create") {
        this.eventBus.trigger("model:created:" + payload.url, payload.data);
      }
    }

    return IO;

  })();

  // always return <the> only instance of this IO class.
  return new IO;

});