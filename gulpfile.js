var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var karma = require('gulp-karma');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

var DEST = 'dist';
var SRC_FILES = ['modules/**/*.js', '!modules/**/test/*.js', '!modules/**/demo/*.js'];
var LB_PORT = 4558;
var testServer;

// clean
gulp.task('clean', function() {
  del('dist');
});

// build
gulp.task('build', ['clean', 'lint', 'compress'], function() {
  return gulp.src(SRC_FILES)
    .pipe(concat('live-set.js'))
    .pipe(gulp.dest(DEST));
});

gulp.task('compress', function() {
  return gulp.src(SRC_FILES)
    .pipe(uglify())
    .pipe(concat('live-set.min.js'))
    .pipe(gulp.dest(DEST));
});

// test
gulp.task('test', ['lint', 'test-server'], function() {
  return gulp.src([
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'modules/*/*.js',
      'modules/*/test/*.test.js'
    ])
    .pipe(karma({
      configFile: 'test/karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    })
    .on('end', function() {
      testServer.close();
      process.nextTick(function() {
        // this should not be required...
        process.exit();
      });
    });
});

gulp.task('test-server', function(done) {
  testServer = require('./test/fixtures/event-source')(LB_PORT, done);
});

gulp.task('lint', function() {
  return gulp.src(['modules/**/*.js', '!modules/change-stream/stream.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});