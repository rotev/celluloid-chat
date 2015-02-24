define(function(require, exports, module) {

  var Backbone    = require('backbone'),
      Handlebars  = require('handlebars'),
      template    = require('text!./action.hbs'),
      Action      = require('models/action');

  return (function() {

    return Backbone.View.extend({

      render: function() {
        var compiledTemplate = Handlebars.compile(template),
            html = compiledTemplate(this.model.attributes);
        this.$el.html(html);
      }
    });

  })();

});