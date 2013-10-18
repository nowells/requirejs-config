module.exports = function(grunt) {
  var rConfig = require('./js/config');

  rConfig.extend({
      baseUrl: './js/',
      out: 'build/main.js',
      name: 'main',
      optimize: 'none'
  });

  grunt.initConfig({
    requirejs: {
      compile: {
        options: rConfig
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.registerTask('default', ['requirejs']);
};
