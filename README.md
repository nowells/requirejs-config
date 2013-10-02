requirejs-config
================

> Simplify &amp; Centralize your RequireJS configurations.

With RequireJS it is often a challenge to find the right way to share a common
configuration across different instances of an application (development,
production, test suite, multiple pages).

```javascript
(function(root, factory) {
  function define(func) { return typeof(module) === 'undefined' ? root.define.apply(this, arguments) : (module.exports = func(require)); }
  define(function(require) {
    return require('../bower_components/requirejs-config/config')(factory);
  });
}(this, function(root, config) {
  config.extend({
    hbs: {
      disableI18n: true,
      disableHelpers: true
    },
    pragmasOnSave: {
      excludeHbsParser: true,
      excludeHbs: true,
      excludeAfterBuild: true
    }
  });

  config.add('jquery', 'bower_components/jquery/jquery');
  config.add('underscore', 'bower_components/underscore/underscore', '_');
  config.add('backbone', 'bower_components/backbone/backbone', 'Backbone', ['jquery', 'underscore']);
}));
```
