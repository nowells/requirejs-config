(function(window) {
  'use strict';

  var require = window.require;

  require(['./config'], function(config) {
    config.config.main.data = 'Development Configuration';
    require.config(config);
    require(['./main'], function() {});
  });
}(this));
