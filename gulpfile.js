const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const rev = require('gulp-rev');
const useref = require('gulp-useref');
const browserSync = require('browser-sync');
const gulpif = require('gulp-if');
const revRewrite = require('gulp-rev-rewrite');
const awspublish = require("gulp-awspublish");
const AWS = require("aws-sdk");

const paths = {
  styles: {
    src: 'src/css/**/*.css',
    dest: 'build/css/'
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'build/js/'
  },
  html: {
    src: 'src/**/*.html',
    dest: 'build/'
  },
  images: {
    src: 'src/images/**/*.*',
    dest: 'build/images/'
  },
  fonts: {
    src: 'src/media/**/*.*',
    dest: 'build/media/'
  }
};

// Below are the S3 properties.
const publisher = awspublish.create({
  region: 'us-east-1',
  params: {
    Bucket: 'fcpersonalloans.com'
  },
  credentials: new AWS.SharedIniFileCredentials({ profile: 'offerannex' })
});
const cache_control = {
  'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate, public'
};

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del([ 'build' ]);
}

/*
 * Define our tasks using plain functions
 */
function styles() {
  return gulp.src(paths.styles.src)
      .pipe(cleanCSS())
      .pipe(rev())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
  return gulp.src(paths.scripts.src)
      .pipe(babel())
      .pipe(uglify())
      .pipe(rev())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(paths.scripts.dest));
}

function watch() {
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
}

function html() {
  return gulp.src(paths.html.src)
      .pipe(useref())
      .pipe(gulpif('*.js', uglify()))
      .pipe(gulpif('*.css', cleanCSS()))
      .pipe(gulpif('*.js', rev()))
      .pipe(gulpif('*.css', rev()))
      .pipe(revRewrite())
      .pipe(gulp.dest(paths.html.dest));
}

function images() {
  return gulp.src(paths.images.src)
      .pipe(gulp.dest(paths.images.dest));
}

function fonts() {
  return gulp.src(paths.fonts.src)
      .pipe(gulp.dest(paths.fonts.dest));
}

function serve(cb) {
  browserSync({
    server: {
      baseDir: './'
    },
    port: 4000,
    notify: false,
    open: false
  }, cb);
}

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.images = images;
exports.fonts = fonts;
exports.watch = watch;
exports.serve = serve;

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
const build = gulp.series(clean, gulp.parallel(html, images, fonts));

/*
 * You can still use `gulp.task` to expose tasks
 */
gulp.task('build', build);

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', build);

const non_html_src = [
  './build/**/*.css',
  './build/**/*.eot',
  './build/**/*.svg',
  './build/**/*.ttf',
  './build/**/*.woff',
  './build/**/*.gif',
  './build/**/*.jpg',
  './build/**/*.png',
  './build/**/*.js',
  './build/**/*.json',
];

gulp.task('publish-assets', function() {
  return gulp.src(non_html_src)
      .pipe(publisher.publish())
      // .pipe(publisher.sync())
      .pipe(awspublish.reporter());
});

gulp.task('publish-html', function() {
  return gulp.src('./build/*.html')
      .pipe(publisher.publish(cache_control))
      .pipe(awspublish.reporter());
});
