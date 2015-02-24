define(function(require, exports, module) {

  var Backbone      = require('backbone');

  return (function() {

    var instance = null;

    function EventBus() {
      if (instance) {
        return instance;
      }

      _.extend(this, Backbone.Events);

      instance = this;
    }

    return EventBus;

  })();

});