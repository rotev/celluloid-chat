define(function(require, exports, module) {

  var Backbone    = require('backbone'),
      Handlebars  = require('handlebars'),
      template    = require('text!./join.hbs'),
      Action      = require('models/action');

  return (function() {

    return Backbone.View.extend({

      initialize: function() {
        this.on('show', function() {
          this.focusInputElement();
          this.initForm();
        });
      },

      focusInputElement: function() {
        this.$el.find('input').focus();
      },

      initForm: function() {
        var form  = this.$el.find('form'),
            input = this.$el.find('input'),
            _this = this;

        form.on('submit', function(e) {
          e.preventDefault();

          var user = input.val();

          var action = new Action({
            type: 'join',
            user: user
          });

          action.save().then(
            function success(response) {
              _this.trigger('join', user);
            },
            function fail(response) {
              alert("Can't start chatting :\\");
            }
          );
        });
      },

      render: function() {
        this.$el.html(Handlebars.compile(template)());
      }
    });

  })();

});