// enables gulp
var gulp = require('gulp');

// command line args for gulp
var args = require('yargs').argv;

// prefix with ./ to look for local file instead of node package
// you can skip the extension ("js")
// n.b. execute the returned function to get access to configured values
var config = require('./gulp.config')();

var del = require('del');

// autoloading gulp-plugins, removed the need
// for separate requires. use $.nameOfThePluginWithoutGulpDash
var $ = require('gulp-load-plugins')({
    lazy: true
});

// bare bones test
gulp.task('hello-world', function() {
    console.log('hello world!');
});

// code checking test
// requires npm install --save-dev
// - gulp-jscs
// - gulp-jshint
// - gulp-if
// - jshint-stylish
gulp.task('check-style', function() {

    log('checking code with jscs and jshint...');

    return gulp
        //        .src([
        //           './src/**/*.js',
        //           './*.js'
        //       ])
        .src(config.jsfiles)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe($.jshint.reporter('fail'));
});

// compiles less to css
gulp.task('less2css', ['clean-temp-css'], function() {

    log('compiling less to css...');

    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        // primitive custom error handler, use gulp-plumber instead!
        //        .on('error', errorLogger)
        .pipe($.autoprefixer({
            browsers: ['last 3 version', '> 10%']
        }))
        .pipe(gulp.dest(config.temp));

});

/*
 * no gulp stream available because we are using
 * node del. Callback function is provided to
 * ensure proper execution order.
 * n.b. callback is used _only_ to notify Orchestrator
 * (or undertaker in gulp 4) about completion of asynchronous
 * operation.
 */
gulp.task('clean-temp-css', function(cleaningDone) {

    log('cleaning compiled css files...');

    var files = config.temp + '/**/*.css';

    clean(files, cleaningDone);
});

gulp.task('less-watcher', function() {
    return gulp.watch(config.less, ['less2css']);
});

///////////

// primitive error handler, replaced with gulp-plumber
function errorLogger(error) {
    log('*** ERROR ***');
    log(error);
    log('*** ERROR ***');
    this.emit('end');
}

function clean(path, cleaningDone) {
    log('cleaning path ' + $.util.colors.cyan(path));
    // call node del and then the callback
    del(path).then(cleaningDone());
}

// logs string and object messages
function log(message) {
    if (typeof(message) === 'object') {
        for (var item in message) {
            if (message.hasOwnProperty(item)) {
                $.util.log($.util.colors.cyan(message[item]));
            }
        }
    }
    if (typeof(message) === 'string') {
        $.util.log($.util.colors.cyan(message));
    }
}
