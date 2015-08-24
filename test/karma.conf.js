module.exports = function(config) {
  config.set({

    plugins: [
      'karma-phantomjs-launcher',
      'karma-mocha',
      'karma-chai',
      'karma-coverage'
    ],

    customLaunchers: {
      Chrome_without_security: {
        base: 'Chrome',
        flags: ['--disable-web-security']
      },
      PhantomJS_without_security: {
        base: 'PhantomJS',
        flags: ['--web-security=no']
      }
    },

    // base path, that will be used to resolve files and exclude
    basePath: '..',

    // frameworks to use
    frameworks: ['mocha', 'chai'],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: [process.env.CI ? 'coverage' : 'progress'],

    preprocessors: {
      'modules/**/*.js': ['coverage']
    },

    coverageReporter: {
      // specify a common output directory
      dir: '.',
      reporters: [
        { type: 'cobertura', subdir: '.', file: 'cobertura-coverage.xml' }
      ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS_without_security'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
