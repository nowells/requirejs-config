(function(root, factory) {
  function define(func) { return typeof(module) === 'undefined' ? root.define.apply(this, arguments) : (module.exports = func(require)); }
  define(function(require) {
    return require('../bower_components/requirejs-config/config')(factory);
  });
}(this, function(root, config) {
  config.extend({
    config: {
      main: {
        data: 'Base Configuration'
      }
    }
  });

  config.add('jquery', '../bower_components/jquery/jquery');
  config.add('underscore', '../bower_components/underscore/underscore', '_');
  config.add('backbone', '../bower_components/backbone-amd/backbone', 'Backbone', ['jquery', 'underscore']);
}));
