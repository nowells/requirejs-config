(function(root, factory) {
  function define(func) { return typeof(module) === 'undefined' ? root.define.apply(this, arguments) : (module.exports = func(require)); }
  define(function(require) { return factory(root); });
}(this, function(root) {
  return function requirejs_config(factory) {
    var config = {};
    config.extend = function extend() {
      for (var index = 0; index < arguments.length; index = index + 1) {
        var source = arguments[index];
        for (var prop in source) {
          this[prop] = source[prop];
        }
      }
    };

    config.add = function requireModule(name, path, globalName, deps) {
      var shim = {},
          maps = [];

      if (typeof(name) === 'object') {
        maps = name.slice(1);
        name = name[0];
      }

      // Allow shorthand for bower
      path = path.replace(/^bower\//, '../components/');

      config.paths[name] = path;

      if (maps.length > 0) {
        for (var i = 0; i < maps.length; i = i + 1) {
          config.map['*'][maps[i]] = name;
        }
      }

      if (globalName || deps) {
        config.shim[name] = shim;

        if (deps) {
          shim.deps = deps;
        }

        if (typeof(globalName) === 'function') {
          shim.init = globalName;
        }
        else {
          shim.exports = globalName;
        }
      }
    };

    config.paths = {};
    config.map = {'*': {}};
    config.shim = {};

    factory.call(root, root, config);

    return config;
};
}));
