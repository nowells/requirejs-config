(function(root, factory) {
  function define(func) { return typeof(module) === 'undefined' ? root.define.apply(this, arguments) : (module.exports = func(require)); }
  define(function(require) { return factory(root); });
}(this, function(root) {
  var Config, formatReplacements = {};

  Config = function() {
    var config, references = [];

    if (!(this instanceof Config)) {
      if (arguments.length !== 1 || typeof(arguments[0]) !== 'function') {
        throw new Error('Config must be instanciated with "new"');
      }
      config = new Config();
      arguments[0](root, config);
      return config;
    }

    Config.prototype.reset = function() {
      Object.keys(this).forEach(function(key) {
        delete this[key];
      }, this);

      this.paths = {};
      this.map = {'*': {}};
      this.shim = {};
      this.packages = [];
      this.config = {};
      references.splice(0, references.length);
    };

    Config.prototype.ref = function(name) {
      if (references.indexOf(name) < 0) {
        references.push(name);
      }
    }

    Config.prototype.module = function(name, fn) {
      references.splice(0, references.length);
      fn.call(this);
      return createModule(this, name, references.splice(0, references.length));
    }

    this.reset();

    Config.prototype.merge = function merge(data) {
      Object.keys(data).forEach(function(key) {
        this[key] = mergeData(this[key], data[key]);
      }, this);
    };

    Config.prototype.extend = Config.prototype.merge;

    Config.prototype.format = function format(key, value) {
      formatReplacements[key] = value;
    };

    Config.prototype.add = function add(name, path) {
      this.ref(name);
      var mappings = [], module;
      if (Array.isArray(name)) {
        mappings = name.slice(1);
        name = name.shift();
      }

      module = createPath(this, name, path);
      module.map(mappings);
      module.shim.apply(module, Array.prototype.slice.call(arguments, 2));
      return module;
    };

    Config.prototype.pkg = function pkg(name, location, main) {
      this.ref(name);
      var record = {name: name};
      if (location) {
        record.location = location;
      }
      if (main) {
        record.main = main;
      }
      this.packages.push(record);
      return createPath(this, name);
    };

    function createPath(config, name, path) {
      var Path = function(name, path) {
        this.name = name;
        if (typeof(path) === 'string') {
          path = path.replace(/^bower\//, '../components/');
            config.paths[name] = formatString(path);
        }
      };

      Path.prototype.map = function(names, context) {
        var record = {}, i = 0;
        names = Array.isArray(names) ? names : [names];

        for (i; i < names.length; i = i + 1) {
          record[names[i]] = this.name;
        }
        context = context || '*';

        config.map[context] = mergeData(config.map[context], record);

        return this;
      };

      Path.prototype.shim = function shim() {
        var record = {}, i = 0, arg;

        for (i; i < arguments.length; i = i + 1) {
          arg = arguments[i];
          if (Array.isArray(arg)) {
            if (record.deps) {
              throw new Error('Cannot define deps twice in one shim call');
            }
            record.deps = arg;
          }
          else if (typeof(arg) === 'function') {
            if (record.init) {
              throw new Error('Cannot define init twice in one shim call');
            }
            record.init = arg;
          }
          else if (typeof(arg) === 'string') {
            if (record.exports) {
              throw new Error('Cannot define exports twice in one shim call');
            }
            record.exports = arg;
          }
          else if (typeof(arg) === 'object' && arguments.length === 1) {
            record = arg;
          }
          else if (typeof(arg) === 'undefined') {
          }
          else {
            throw new Error('Invalid parameters to shim');
          }
        }

        config.shim[this.name] = mergeData(config.shim[this.name], record);

        return this;
      };

      return new Path(name, path);
    }

    function createModule(config, name, modules) {
      var Module = function() {
        this.name = name;
      };

      return new Module();
    }

    var baseConfig = this;

    Config.prototype.done = function() {
      var requirejs = require('./r');
        err = new Error(),
        basePath = err.stack.split("\n")[2].match(/\(([^:]+):/)[1];

      requirejs.tools.useLib(function(require) {
        var parse = require('parse'),
          path = require('path'),
          fs = require('fs'),
          dependencies = {},
          rootPath = path.join(path.dirname(basePath), baseConfig.appDir || baseConfig.baseUrl);

        baseConfig.baseUrl = rootPath;
        requirejs.config(baseConfig);

        function findDeps(module) {
          var content, deps;
          if (dependencies[module] !== undefined) {
            return dependencies[module];
          }

          try {
            var content = fs.readFileSync(requirejs.toUrl(module) + '.js');
            deps = parse.findDependencies(module, content)
            dependencies[module] = deps;

            deps.forEach(function(dep) {
              findDeps(dep);
            }, this);
          }
          catch (e) {
            dependencies[module] = [];
          }
        }
        findDeps('main');
        console.log(dependencies);
      });
    };
  };


  function mergeData(target, src) {
    var array = Array.isArray(src),
      dst = array && [] || {};

    if (typeof(target) !== 'object') {
      return src;
    }

    if (array) {
      target = target || [];
      dst = dst.concat(target);
      src.forEach(function(e, i) {
        if (typeof target[i] === 'undefined') {
          dst[i] = e;
        } else if (typeof e === 'object') {
          dst[i] = mergeData(target[i], e);
        } else {
          if (target.indexOf(e) === -1) {
            dst.push(e);
          }
        }
      });
    } else {
      if (target && typeof target === 'object') {
        Object.keys(target).forEach(function(key) {
          dst[key] = target[key];
        });
      }
      Object.keys(src).forEach(function(key) {
        if (typeof src[key] !== 'object' || !src[key]) {
          dst[key] = src[key];
        }
        else {
          if (!target[key]) {
            dst[key] = src[key];
          } else {
            dst[key] = mergeData(target[key], src[key]);
          }
        }
      });
    }

    return dst;
  }

  function formatString(str) {
    if (typeof(str) !== 'string') {
      return str;
    }
    return str.replace(/{([a-zA-Z0-9_.\-]+)}/g, function(match, key) {
      return typeof formatReplacements[key] !== 'undefined' ?
        formatReplacements[key] : match;
    });
  }

  return Config;
}));
