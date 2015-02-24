requirejs.config({
  paths: {
    'jquery': 'bower_components/jquery/dist/jquery',
    'backbone': 'bower_components/backbone/backbone',
    'json2': 'bower_components/json2/json2',
    'underscore': 'bower_components/underscore/underscore',
    'backbone.websockets': 'lib/backbone.websockets',
    'backbone.dualStorage': 'bower_components/Backbone.dualStorage/backbone.dualStorage.amd',
    'io': 'io',
    'handlebars': 'bower_components/handlebars/handlebars',
    'text': 'bower_components/text/text',
    'lil-uuid': 'bower_components/lil-uuid/uuid'
  },
  shim: {
    underscore: {
      exports: "_"
    },
    backbone: {
      deps: ["jquery", "underscore", "json2"],
      exports: "Backbone"
    },
    'backbone.websockets': {
      deps: ["backbone", "jquery", "underscore", "io"]
    },
    'backbone.dualStorage': {
      deps: ["backbone", "backbone.websockets"]
    },
    jlivetime: {
      deps: ["jquery"],
      exports: "$"
    },
    autosize: {
      deps: ["jquery"],
      exports: "$"
    },
    jquery_hammer: {
      deps: ["jquery", "hammerjs"],
      exports: "$"
    },
    zenbox: {
      deps: ["jquery"],
      exports: "Zenbox"
    },
    picker: {
      deps: ["jquery"]
    },
    pickadate: {
      deps: ["jquery", "picker"],
      exports: "pickadate"
    }
  }
});

require([
  'text',
  'jquery',
  'backbone', 
  'backbone.websockets',
  'backbone.dualStorage',
  'app'
  ], function(text, $, Backbone, BackboneWS, BackboneDS, app) {

    app.start();

});