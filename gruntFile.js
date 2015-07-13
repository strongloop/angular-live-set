'use strict';

module.exports = function (grunt) {

  // Loading external tasks
  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('serve', ['test-server', 'dist', 'connect:continuous', 'watch']);
  grunt.registerTask('test', ['test-server', 'karma:continuous'])

  grunt.registerTask('dist', ['clean', 'concat:main', 'concat:demo']);

  grunt.registerTask('test-server', function() {
    var done = this.async();
    var LB_PORT = 4558;
    require('./test/fixtures/event-source')(LB_PORT, done);
  });

  // HACK TO LIST ALL THE MODULE NAMES
  var moduleNames = grunt.file.expand({cwd: 'modules'}, ['*', '!utils.js']);
  function ngMinModulesConfig(memo, moduleName) {

    memo[moduleName] = {
      expand: true,
      cwd: 'modules/' + moduleName,
      src: ['*.js'],
      dest: 'dist/sub/' + moduleName
    };

    return memo;
  }

  // HACK TO MAKE TRAVIS WORK
  var testConfig = function (configFile, customOptions) {
    var options = {configFile: configFile, singleRun: true};
    var travisOptions = process.env.TRAVIS && {browsers: ['Firefox', 'PhantomJS'], reporters: ['dots']};
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  // Project configuration.
  grunt.initConfig({
    bower: 'bower_components',
    dist: '<%= bower %>/angular-ui-docs',
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''].join('\n')
    },
    watch: {
      src: {
        files: ['modules/**/*.js', '!modules/**/test/*Spec.js', 'demo/**/*.js'],
        tasks: ['karma:unit:run', 'dist:main', 'dist:demo']
      },
      test: {
        files: ['modules/**/test/*Spec.js'],
        tasks: ['karma:unit:run']
      },
      demo: {
        files: ['modules/**/demo/*'],
        tasks: ['dist:demo']
      },
      livereload: {
        files: ['demo/*'],
        options: {livereload: true}
      }
    },
    connect: {
      options: {
        base: '.',
        open: true,
        livereload: true
      },
      server: {options: {keepalive: true}},
      continuous: {options: {keepalive: false}}
    },
    karma: {
      unit: testConfig('test/karma.conf.js'),
      server: {configFile: 'test/karma.conf.js'},
      continuous: {configFile: 'test/karma.conf.js', background: false}
    },
    concat: {
      demo: {
        files: {'dist/demo/index.html': [
          'demo/demo-hdr.html',
          'modules/**/demo/index.html',
          'demo/demo-ftr.html'
        ]}
      },
      main: {
        files: {'dist/live-set.js': ['modules/**/*.js', '!modules/**/test/*.js', '!modules/**/demo/*.js']}
      }
    },
    uglify: {
      options: {banner: '<%= meta.banner %>'},
      main: {
        files: {
          'dist/live-set.min.js': ['dist/live-set.js']
        }
      }
    },
    clean: {
      src: ['dist']
    },
    jshint: {
      src: {
        files: {src: ['modules/**/*.js', '!modules/**/test/*Spec.js']},
        options: {jshintrc: '.jshintrc'}
      },
      test: {
        files: {src: ['modules/**/test/*Spec.js', 'gruntFile.js']},
        options: grunt.util._.extend({}, grunt.file.readJSON('.jshintrc'), {
          node: true,
          globals: {
            angular: false,
            inject: false,
            jQuery: false,
            jasmine: false,
            afterEach: false,
            beforeEach: false,
            ddescribe: false,
            describe: false,
            expect: false,
            iit: false,
            it: false,
            spyOn: false,
            xdescribe: false,
            xit: false
          }
        })
      }
    },
    ngmin: moduleNames.reduce(ngMinModulesConfig, {})
  });

};
