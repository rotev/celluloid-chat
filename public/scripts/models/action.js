define(function(require, exports, module) {

  var Backbone = require('backbone');
  
  return (function() {

    var Action = Backbone.Model.extend({
      url: 'actions',

      initialize: function() {
        Action.__super__.initialize.apply(this, arguments);

        // automatically set created_at to the current time.
        if (!this.get('created_at')) {
          this.set('created_at', moment().format());
        }
      }
    });

    return Action;

  })();

});