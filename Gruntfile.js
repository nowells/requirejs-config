module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        // '-a' for all files
        commitFiles: [
          // Hack to ensure that our bump commit works.
          '--no-verify',
          // Actual files to change.
          'package.json', 'bower.json',
          'config.js'
        ],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        // options to use with '$ git describe'
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
      }
    },

    karma: {
      options: {
        configFile: 'karma.conf.js',
        browsers: ['PhantomJS']
      },
      continuous: {
        reporters: 'dots',
        singleRun: true
      },
      dev: {
        singleRun: false
      }
    },

    jshint: {
      files: ['config.js', 'specs/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'karma:continuous']);
  grunt.renameTask('bump', 'nonBuildBump');
  grunt.registerTask('bump', ['nonBuildBump::bump-only', 'default', 'nonBuildBump::commit-only']);
};
