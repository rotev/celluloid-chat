define(function(require, exports, module) {

  var Backbone    = require('backbone'),
      Handlebars  = require('handlebars'),
      template    = require('text!./action.hbs'),
      Action      = require('models/action'),
      moment      = require('moment');

  return (function() {

    return Backbone.View.extend({

      render: function() {
        var compiledTemplate = Handlebars.compile(template),
            timestamp = moment(this.model.get('created_at')).format("D/M/YY, H:mm:ss"),
            templateAttributes = _.extend({}, this.model.attributes, {timestamp: timestamp}),
            html = compiledTemplate(templateAttributes);
        this.$el.html(html);
      }
    });

  })();

});