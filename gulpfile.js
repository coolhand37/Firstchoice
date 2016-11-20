'use strict';

var gulp = require('gulp');
var rimraf = require('rimraf');
var serve = require('gulp-serve');
var uglify = require("gulp-uglify");
var minifyCss = require("gulp-minify-css");
var usemin = require("gulp-usemin");
var rev = require("gulp-rev");
var foreach = require("gulp-foreach");


/****************************************
  JS
*****************************************/

gulp.task("clean", function (cb) {
  return rimraf("build", cb);
});

gulp.task("images", function (cb) {
  return gulp.src("./src/images/*.*")
             .pipe(foreach(function (stream, file) {
               return stream.pipe(gulp.dest("./build/images"));
             }));
});

gulp.task("fonts", function () {
  return gulp.src("./bower_components/font-awesome/fonts/*.*")
             .pipe(foreach(function (stream, file) {
               return stream.pipe(gulp.dest("./build/fonts"));
             }));
})

gulp.task("build", ["images", "fonts"], function () {
  return gulp.src("./src/*.html")
             .pipe(foreach(function (stream, file) {
               return stream.pipe(usemin({
                 css: [minifyCss(), rev()],
                 js: [uglify(), rev()]
               }))
               .pipe(gulp.dest("./build"));
             }));
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
  root: ['./src'],
  port: process.env.PORT || 9000
}));

gulp.task("serve-build", serve({
  root: ["./build"],
  port: process.env.PORT || 8000
}));

/****************************************
  Watch
*****************************************/

gulp.task('watch', ['build'], function () {
  return gulp.watch(['src/**/*.js'], ['build'])
})

// Default
gulp.task('default', ['serve', 'watch']);
