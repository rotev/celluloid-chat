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
        _.bindAll(this, 'handleActionCreated');

        this.eventBus = eventBus;
        this.eventBus.on('model:created:actions', this.handleActionCreated);

        this.user = user;

        //this.tempSendMessages();

        this.$el.addClass('chat');

        this.actions = new ActionCollection();
        this.actions.bind("change reset add remove", this.renderActions, this);
        this.actions.fetch();

        // focus on the compose element.
        var _this = this;
        this.on('show', function() {
          _this.$el.find('.chat-compose input').focus();
        });

        this.on('render', this.initCompose);
      },

      render: function() {
        this.$el.html(Handlebars.compile(template)());
        this.trigger('render');
      },

      renderActions: function() {
        var actionsElem = this.$el.find('.chat-actions').html("");

        var _this = this;

        this.actions.each(function(action) {
          var component = new ActionComponent({model: action});
          component.render();
          actionsElem.append(component.$el)
                   .scrollTop(actionsElem[0].scrollHeight);
        });
      },

      handleActionCreated: function(action) {
        var model = new Action(action);
        this.actions.add(model);
      },

      initCompose: function() {
        var _this   = this,
            form    = this.$el.find('form'),
            input   = this.$el.find('input');

        form.submit(function(e) {
          e.preventDefault();

          var message = input.val();

          if (message === "") {
            alert('invalid message');
            return;
          }

          // create action.
          var action = new Action({
            type: 'message',
            user: _this.user,
            message: message
          });
          action.save();

          input.val('');
        });
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