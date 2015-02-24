define(function(require, exports, module) {

  var _         = require('underscore'),
      $         = require('jquery'),
      Backbone  = require('backbone'),
      io        = require('io');


  return (function() {

    var urlError = function() { throw new Error('A "url" property or function must be specified.'); },
        ajaxSync = Backbone.sync;

    /**
     * Preserve the standard, jquery ajax based persistance method as ajaxSync.
     */
    Backbone.ajaxSync = function(method, model, options){
      return ajaxSync.call(this, method, model, options);
    };
    
    /**
     * Replace the standard sync function with our new, websocket based solution.
     */
    Backbone.sync = function(method, model, options){
      var opts = _.extend({}, options),
          defer = $.Deferred(),
          promise = defer.promise();

      opts.url = (opts.url) ? _.result(opts, 'url') : (model.url) ? _.result(model, 'url') : void 0;

      // If no url property has been specified, throw an error, as per the standard Backbone sync
      if (!opts.url) urlError();

      // Determine what data we're sending, and ensure id is present if we're performing a PATCH call
      if (!opts.data && model) opts.data = opts.attrs || model.toJSON(options) || {};
      if ((opts.data.id === null || opts.data.id === void 0) && opts.patch === true && model){
          opts.data.id = model.id;
      }

      var payload = {
        url: opts.url,
        method: method,
        data: opts.data
      };

      io.send(payload)
        .then(
          function success(response, status) {
            if (_.isFunction(options.success)) options.success(response);
            defer.resolve(response);
          },

          function fail(response, status) {
            promise.status = 0;
            if (_.isFunction(options.error)) options.error(promise);
            defer.reject(promise);
          });

      return promise;
    };

  })();

});

