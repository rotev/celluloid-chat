define(function(require, exports, module) {

  var Backbone          = require('backbone'),
      Handlebars        = require('handlebars'),
      template          = require('text!./chat.hbs'),
      Action            = require('models/action'),
      ActionCollection  = require('models/action_collection'),
      ActionComponent   = require('components/action/action');

  return (function() {

    return Backbone.View.extend({

      initialize: function(eventBus, user) {
        _.bindAll(this, 'handleAction');

        this.eventBus = eventBus;
        this.eventBus.on('model:created:actions', this.handleAction);

        this.user = user;

        this.tempSendMessages();

        this.$el.addClass('chat');

        this.actions = new ActionCollection();
        this.actions.bind("change reset add remove", this.renderActions, this);
        this.actions.fetch();
        
      },

      render: function() {
        this.$el.html(Handlebars.compile(template)());
      },

      renderActions: function() {
        this.$el.html("");

        var _this = this;

        this.actions.each(function(action) {
          var component = new ActionComponent({model: action});
          component.render();
          _this.$el.append(component.$el)
                   .scrollTop(_this.$el[0].scrollHeight);
        });
      },

      handleAction: function(action) {
        var model = new Action(action);
        this.actions.add(model);
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
        }, 3000);
      }
      
    });

  })();

});