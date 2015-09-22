// enables gulp
var gulp = require('gulp');

// command line args for gulp
var args = require('yargs').argv;

// autoloading gulp-plugins, removed the need
// for separate requires. use $.nameOfThePluginWithoutGulpDash
var $ = require('gulp-load-plugins')({
    lazy: true
});

// bare bones test
gulp.task('hello-world', function () {
    console.log('hello world!');
});

// code checking test
// requires npm install --save-dev
// - gulp-jscs
// - gulp-jshint
// - gulp-if
// - jshint-stylish
gulp.task('check-style', function () {

    log('checking code with jscs and jshint...');

    return gulp
        .src([
           './src/**/*.js',
           './*.js'
       ])
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe($.jshint.reporter('fail'));
});

///////////

// logs string and object messages
function log(message) {
    if (typeof (message) === 'object') {
        for (var item in message) {
            if (message.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(message[item]));
            }
        }
    }
    if (typeof (message) === 'string') {
        $.util.log($.util.colors.blue(message));
    }
}
