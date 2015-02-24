define(function(require, exports, module) {

  var Backbone      = require('backbone'),
      EventBus      = require('event_bus'),
      JoinComponent = require('components/join/join'),
      ChatComponent = require('components/chat/chat');

  return (function() {

    return {
      start: function() {
        this.eventBus = new EventBus();
        this.displayJoinScreen();
      },

      displayJoinScreen: function() {
        var _this = this,
            joinComponent = new JoinComponent();

        this.show(joinComponent);

        joinComponent.on('join', function(user) {
          _this.user = user;
          _this.displayChatScreen();
        });
      },

      displayChatScreen: function() {
        var _this = this,
            chatComponent = new ChatComponent(this.eventBus, this.user);

        this.show(chatComponent);
      },

      show: function(view) {
        view.render();
        $('#container').html('').append(view.$el);
        view.trigger('show');
      }
    }

  })();

});