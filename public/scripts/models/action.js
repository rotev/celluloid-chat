define(function(require, exports, module) {

  var Backbone = require('backbone');
  
  return (function() {

    return Backbone.Model.extend({
      url: 'actions'
    });

  })();

});