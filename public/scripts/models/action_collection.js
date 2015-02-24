define(function(require, exports, module) {

  var Backbone  = require('backbone'),
      Action    = require('models/action');
  
  return (function() {

    return Backbone.Collection.extend({
      model: Action,
      url: 'actions'
    });

  })();

});