define(function(require, exports, module) {

  var Backbone  = require('backbone'),
      Action    = require('models/action'),
      moment    = require('moment');
  
  return (function() {

    var ActionCollection = Backbone.Collection.extend({
      model: Action,
      url: 'actions',

      initialize: function() {
        _.bindAll(this, "syncDirtyAndDestroyed", "removeOfflineActions");
      },

      comparator: function(model) {
        return moment(model.get('created_at'));
      },

      fetchThenSync: function() {
        var _this = this;

        // fetch actions, and when done sync unsaved messages with the server.
        this.fetch({success: this.syncDirtyAndDestroyed});
      },

      syncDirtyAndDestroyed: function() {
        ActionCollection.__super__.syncDirtyAndDestroyed.call(this, {
          success: this.removeOfflineActions
        });
      },

      removeOfflineActions: function() {
        // hack: there's no easy way to determine which of the duplicated actions 
        // is the offline one. As a temporary hack the collection is simply fetched again.
        this.fetch();
      }

    });

    return ActionCollection;

  })();

});