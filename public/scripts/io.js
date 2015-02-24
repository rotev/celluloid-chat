define(function(require, exports, module) {

  var $         = require('jquery'),
      _         = require('underscore'),
      lil       = require('lil-uuid'),
      EventBus  = require('event_bus');

  var IO,
      instance = null;

  IO = (function() {
    function IO() {
      if (!instance) instance = this;

      this.eventBus = new EventBus();

      _.bindAll(this, 'onMessage', 'getSocket');

      return instance;
    }

    IO.prototype.socket = null;

    IO.prototype.responseListeners = {};

    IO.prototype.getSocket = function() {
      if (this.socket) {
        return $.Deferred().resolve(this.socket).promise();
      }

      var deferred = $.Deferred(),
          SocketKlass = "MozWebSocket" in window ? MozWebSocket : WebSocket,
          ws = new SocketKlass('ws://' + window.location.host + '/sync'),
          _this = this;

      ws.onopen = function(event) {
        _this.socket = ws;
        deferred.resolve(_this.socket);
      };

      ws.onmessage = this.onMessage;

      return deferred.promise();
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

      this.getSocket().then(function(socket) {

        // wait for response.
        _this.onceResponse(requestId, function(response) {
          var resolveOrReject = response.status === "ok" ? defer.resolve : defer.reject;
          resolveOrReject(response.data, response.status)
        });

        // send payload.
        socket.send(JSON.stringify(payload));
      });
      
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

  return new IO;

});