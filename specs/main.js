/*jshint -W064*/
/*global define*/
define(function(require) {
  'use strict';

  var expect = require('chai').expect,
      _ = require('underscore'),
      describe = window.describe,
      beforeEach = window.beforeEach,
      it = window.it,
      Config = require('config'),
      config = new Config();

  function testCleanConfig() {
    expect(_(config).keys().sort()).to.deep.equal(
        ['config', 'map', 'paths', 'packages', 'shim'].sort()
    );
    expect(config.paths).to.deep.equal({});
    expect(config.map).to.deep.equal({'*': {}});
    expect(config.shim).to.deep.equal({});
  }

  return function() {
    describe('Config', function() {
      it('should pass initial reset test', function() {
        testCleanConfig();
      });

      it('should raise an exception if not intantiated with new', function() {
        expect(Config).to.throw(Error);
      });

      it('should instantiating Config by calling non-new with ' +
         '(root, factory) parameters', function() {
        expect(function() {
          return Config(function() {});
        }).to.not.throw(Error);

        expect(Config(function(root, config) {
          config.add('foo', 'bar');
        })).to.have.deep.property('paths.foo', 'bar');
      });

      it('should have a clean exposed API', function() {
        expect(config.reset).to.be.a('function');
        expect(config.add).to.be.a('function');
        expect(config.merge).to.be.a('function');
        expect(config.extend).to.be.a('function');
        // Legacy alias
        expect(config.extend).to.equal(config.merge);
      });

      describe('#reset', function() {
        it('should reset the exposed state', function() {
          expect(testCleanConfig).to.not.throw(Error);

          config.test = null;
          config.map.foo = 'bar';
          expect(_(config).keys().sort()).to.deep.equal(
              ['config', 'packages', 'map', 'paths', 'shim', 'test'].sort()
          );
          expect(testCleanConfig).to.throw(Error);

          config.reset();
          expect(testCleanConfig).to.not.throw(Error);
        });
      });
    });

    describe('Config', function() {
      beforeEach(function() {
        config.reset();
      });

      describe('#merge', function() {
        it('should allow incremental extention', function() {
          config.merge({
            name: 'foo',
            map: {
              'foo': 'bar',
              'baz': 'overwrite',
              'arr': [1, 2]
            }
          });

          config.merge({
            map: {
              'baz': 'bit',
              'arr': [3]
            }
          });

          expect(config.name).to.equal('foo');
          expect(config).to.have.deep.property('map.foo', 'bar');
          expect(config).to.have.deep.property('map.baz', 'bit');
          expect(config).to.have.deep.property('map.arr');
          expect(config.map.arr).to.deep.equal([1, 2, 3]);
        });
      });

      describe('#add', function() {
        it('should allow adding a new module path', function() {
          config.add('underscore', '../components/underscore');

          expect(config).to.have.deep.property(
              'paths.underscore',
              '../components/underscore'
          );
        });

        it('should replace formattings in paths', function() {
          config.format('bower', '../components');
          config.add('underscore', '{bower}/underscore');

          expect(config).to.have.deep.property(
              'paths.underscore',
              '../components/underscore'
          );
        });

        it('should not replace missing formattings in paths', function() {
          config.format('bower', '../components');
          config.add('underscore', '{bower}/{root}/underscore');

          expect(config).to.have.deep.property(
              'paths.underscore',
              '../components/{root}/underscore'
          );
        });

        it('should handle legacy ^bower/ to ../components format', function() {
          config.add('underscore', 'bower/underscore');

          expect(config).to.have.deep.property(
              'paths.underscore',
              '../components/underscore'
          );
        });

        it('should return an object that can handle shim and map', function() {
          var _Module = config.add('underscore', '../components/underscore');

          expect(_Module.name).to.equal('underscore');
          expect(_Module.shim).to.be.a('function');
          expect(_Module.map).to.be.a('function');
        });

        it('should allow chaining', function() {
          var _Module = config.add('underscore', '../components/underscore');
          expect(_Module.shim().map().shim()).to.equal(_Module);
        });

        it('should allow defining only shim and map with no path', function() {
          var _Module = config.add('underscore');
          expect(_(config.paths).keys()).to.deep.equal([]);

          expect(_Module.name).to.equal('underscore');
          expect(_Module.shim).to.be.a('function');
          expect(_Module.map).to.be.a('function');
        });

        describe('#map', function() {
          it('should allow defining a single mapping in the default ' +
             'context', function() {
               config.add('underscore').map('foo');
               expect(config).to.have.deep.property('map.*.foo', 'underscore');
             });

          it('should allow defining a single mapping in a custom ' +
             'context', function() {
               config.add('jquery').map('foo', 'baz');
               expect(config).to.have.deep.property('map.baz.foo', 'jquery');
             });

          it('should allow defining multiple mappings in the default ' +
             'context', function() {
               config.add('jquery').map(['foo', 'bar']);
               expect(config).to.have.deep.property('map.*.foo', 'jquery');
               expect(config).to.have.deep.property('map.*.bar', 'jquery');
             });

          it('should allow defining multiple mappings in a custom ' +
             'context', function() {
               config.add('jquery').map(['foo', 'bar'], 'baz');
               expect(config).to.have.deep.property('map.baz.foo', 'jquery');
               expect(config).to.have.deep.property('map.baz.bar', 'jquery');
             });
        });

        describe('#shim', function() {
          it('should allow defining just a modules dependencies', function() {
            config.add('jquery').shim(['foo']).shim(['bar']);
            expect(config).to.have.deep.property('shim.jquery.deps');
            expect(config.shim.jquery.deps).to.deep.equal(['foo', 'bar']);
          });

          it('should allow defining just a modules export', function() {
            config.add('jquery').shim('$');
            expect(config).to.have.deep.property('shim.jquery.exports');
            expect(config.shim.jquery.exports).to.equal('$');
          });

          it('should allow defining just a modules export', function() {
            config.add('jquery').shim('$');
            expect(config).to.have.deep.property('shim.jquery.exports');
            expect(config.shim.jquery.exports).to.equal('$');
          });

          it('should allow defining just a modules export', function() {
            config.add('jquery').shim('$');
            expect(config).to.have.deep.property('shim.jquery.exports');
            expect(config.shim.jquery.exports).to.equal('$');
          });

          it('should allow defining just a modules init method', function() {
            var init = function() {};
            config.add('jquery').shim(init);
            expect(config).to.have.deep.property('shim.jquery.init');
            expect(config.shim.jquery.init).to.equal(init);
          });

          it('should allow defining shim in any order', function() {
            var init = function() {};

            config.add('jquery').shim(init, '$', ['underscore']);
            expect(config).to.have.deep.property('shim.jquery.init');
            expect(config).to.have.deep.property('shim.jquery.deps');
            expect(config).to.have.deep.property('shim.jquery.exports');
            expect(config.shim.jquery.init).to.equal(init);
            expect(config.shim.jquery.exports).to.equal('$');
            expect(config.shim.jquery.deps).to.deep.equal(['underscore']);

            config.add('jquery2').shim(['underscore'], init, '$');
            expect(config).to.have.deep.property('shim.jquery2.init');
            expect(config).to.have.deep.property('shim.jquery2.deps');
            expect(config).to.have.deep.property('shim.jquery2.exports');
            expect(config.shim.jquery2.init).to.equal(init);
            expect(config.shim.jquery2.exports).to.equal('$');
            expect(config.shim.jquery2.deps).to.deep.equal(['underscore']);

            config.add('jquery3').shim('$', ['underscore'], init);
            expect(config).to.have.deep.property('shim.jquery3.init');
            expect(config).to.have.deep.property('shim.jquery3.deps');
            expect(config).to.have.deep.property('shim.jquery3.exports');
            expect(config.shim.jquery3.init).to.equal(init);
            expect(config.shim.jquery3.exports).to.equal('$');
            expect(config.shim.jquery3.deps).to.deep.equal(['underscore']);
          });

          it('should allow defining shim with an object', function() {
            var init = function() {};

            config.add('jquery').shim({
              init: init, exports: '$', deps: ['underscore']
            });
            expect(config).to.have.deep.property('shim.jquery.init');
            expect(config).to.have.deep.property('shim.jquery.deps');
            expect(config).to.have.deep.property('shim.jquery.exports');
            expect(config.shim.jquery.init).to.equal(init);
            expect(config.shim.jquery.exports).to.equal('$');
            expect(config.shim.jquery.deps).to.deep.equal(['underscore']);
          });
        });

        describe('legacy support', function() {
          it('should allow a legacy syntax of passing map and shim ' +
             'configuration in in one shot', function() {
            var init = function() {};
            config.add(['jquery', 'baz'], '../jquery', '$', ['foo'], init);
            expect(config).to.have.deep.property('paths.jquery', '../jquery');
            expect(config).to.have.deep.property('shim.jquery.exports', '$');
            expect(config).to.have.deep.property('shim.jquery.init', init);
            expect(config).to.have.deep.property('shim.jquery.deps');
            expect(config.shim.jquery.deps).to.deep.equal(['foo']);
            expect(config).to.have.deep.property('map.*.baz', 'jquery');
          });
        });
      });

      describe('#pkg', function() {
        it('should allow defining a package', function() {
          config.pkg('foo');
          expect(config.packages).to.deep.equal([{name: 'foo'}]);
        });

        it('should allow chaining map and shim calls', function() {
          config.pkg('foo').map('bar');
          expect(config.packages).to.deep.equal([{name: 'foo'}]);
          expect(config).to.deep.have.property('map.*.bar', 'foo');
        });

        it('should allow providing main and location', function() {
          config.pkg('foo', '../../components/foo', 'bar');
          expect(config.packages).to.deep.equal([{
            name: 'foo', location: '../../components/foo', main: 'bar'
          }]);
        });
      });

      describe('#module', function() {
        it('should capture referenced items', function() {
          var module1, module2;
          module1 = config.module('test', function() {
            config.add('jquery');
            config.add('bar');
          });

          module2 = config.module('testing', function() {
            config.add('jquery2');
            config.add('bar');
          });

          expect(module1).to.have.deep.property('name', 'test');
          expect(module2).to.have.deep.property('name', 'testing');
        });
      });
    });
  };
});
