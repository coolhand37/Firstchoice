'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var rimraf = require('rimraf');
var serve = require('gulp-serve');


/****************************************
  JS
*****************************************/

var bundler = browserify({
  entries: ['./src/index.js'],
  debug: true
});

bundler.on('log', gutil.log); // output build logs to terminal

gulp.task('clean', function (cb) {
  rimraf('build', cb);
});

gulp.task('build', ['clean'], function () {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('build'));
});


/****************************************
  Servers (Web and API)
*****************************************/

// apiServer.use(jsonServer.defaults);
// apiServer.use(router);

// gulp.task('serve:api', function (cb) {
//   apiServer.listen(3000, cb);
// });

gulp.task('serve', serve({
  root: ['.'],
  port: process.env.PORT || 9000
}));

/****************************************
  Watch
*****************************************/

gulp.task('watch', ['build'], function () {
  return gulp.watch(['src/**/*.js'], ['build'])
})

// Default
gulp.task('default', ['serve', 'watch']);