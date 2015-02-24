define(function(require, exports, module) {

  var Backbone    = require('backbone'),
      Handlebars  = require('handlebars'),
      template    = require('text!./connectivity-indicator.hsb');

  return (function() {

    return Backbone.View.extend({

      initialize: function(eventBus) {
        this.eventBus = eventBus;
        this.online = false; // temporary

        var _this = this;

        this.eventBus.on('offline', function() { _this.online = false; _this.render(); });
        this.eventBus.on('online', function() { _this.online = true; _this.render(); });

        this.$el.addClass('connectivity-indicator');
      },

      render: function() {
        var compiledTemplate = Handlebars.compile(template),
            templateAttributes = {online: this.online},
            html = compiledTemplate(templateAttributes);
        this.$el.html(html);
        this.$el.toggleClass('online', this.online);
      }
    });

  })();

});