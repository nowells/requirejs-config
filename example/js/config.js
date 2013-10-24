(function(root, factory) {
  function define(func) { return typeof(module) === 'undefined' ? root.define.apply(this, arguments) : (module.exports = func(require)); }
  define(function(require) {
    return require('../bower_components/requirejs-config/config')(factory);
  });
}(this, function(root, config) {
  config.merge({
    config: {
      main: {
        data: 'Base Configuration'
      }
    }
  });

  config.format('bower', '../bower_components');

  config.add('jquery', '{bower}/jquery/jquery');
  config.add('underscore', '{bower}/underscore/underscore').shim('_');
  config.add('backbone', '{bower}/backbone-amd/backbone').shim('Backbone', ['jquery', 'underscore']);
}));
