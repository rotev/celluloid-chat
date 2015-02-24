define(function(require, exports, module) {

  var Backbone    = require('backbone'),
      Handlebars  = require('handlebars'),
      template    = require('text!./chat.hbs'),
      Action      = require('models/action');

  return (function() {

    return Backbone.View.extend({

      initialize: function(eventBus, user) {
        _.bindAll(this, 'handleAction');

        this.eventBus = eventBus;
        this.eventBus.on('model:created:actions', this.handleAction);

        this.user = user;

        this.tempSendMessages();

        this.$el.addClass('chat');
      },

      render: function() {
        this.$el.html(Handlebars.compile(template)());
      },

      handleAction: function(action) {
        switch(action.type) {
          case 'message':
            html = '<div class="action action-message"><strong>' + action.user + '</strong> ' + action.message + '</div>';
            break;

          case 'leave':
            html = '<div class="action action-status action-leave"><strong>' + action.user + '</strong> has left.</div>';
            break;

          case 'join':
            html = '<div class="action action-status action-join"><strong>' + action.user + '</strong> joined.</div>';
            break;
        }

        if (html) {
          this.$el
            .append(html)
            .scrollTop(this.$el[0].scrollHeight);
        }
      },

      tempSendMessages: function() {
        var msgCounter = 1;

        setInterval(function() {
          var action = new Action({
            type: 'message',
            user: this.user,
            message: (msgCounter++).toString()          
          });
          action.save();
        }, 5000);
      }
      
    });

  })();

});