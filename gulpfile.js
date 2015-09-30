// enables gulp
var gulp = require('gulp');

// command line args for gulp
var args = require('yargs').argv;

var browserSync = require('browser-sync');

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

var port = process.env.PORT || config.defaultPort;

/*
    Invoke gulp-task-listing -plugin to output
    all available gulp tasks.
 */
gulp.task('help', $.taskListing);

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

gulp.task('clean-temp-js', function(cleaningDone) {

    log('cleaning transpiled js files...');

    var files = config.temp + '/**/*.js';

    clean(files, cleaningDone);
});

gulp.task('clean-build-fonts', function(cleaningDone) {

    log('cleaning font files from build dir...');

    var files = config.build + '/fonts/**/*.*';

    clean(files, cleaningDone);
});

gulp.task('clean-build-images', function(cleaningDone) {

    log('cleaning image files from build dir...');

    var files = config.build + '/images/**/*.*';

    clean(files, cleaningDone);
});

gulp.task('clean', function(cleaningDone) {
    var filesToClean = [].concat(
        config.build,
        config.temp);
    log('cleaning files: ' + $.util.colors.red(filesToClean));

    del(filesToClean, cleaningDone);
});

gulp.task('less-watcher', function() {
    return gulp.watch(config.less, ['less2css']);
});

gulp.task('jsx-watcher', function() {
    return gulp.watch(config.jsxFiles, ['jsx']);
});

gulp.task('jsx', ['clean-temp-js'], function() {

    log('Transpiling jsx to js...');

    return gulp.src(config.clientjs)
        .pipe($.react())
        .pipe(gulp.dest(config.temp));
});

/*
 * This task is run automatically when any
 * bower packages get installed. Check out
 * .bowerrc.
 */
gulp.task('wiredep', ['jsx'], function() {

    log('Wiring up bower css+js and app js into html...');

    var options = config.getWiredepDefaultOptions();

    // require wiredep and use it's stream, which
    // enables piping via gulp.
    var wiredep = require('wiredep').stream;

    // n.b. use name-parameter for gulp-inject, because we
    // are (possibly) injecting in multiple tasks.
    return gulp
        .src(config.indexFile)
        .pipe($.debug())
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.builtjs, {
            read: false
        }), {
            name: 'scripts'
        }))
        .pipe(gulp.dest(config.client + '/'));
});

gulp.task('inject', ['wiredep', 'less2css'], function() {

    log('Wiring up app css into html...');

    // n.b. use name-parameter for gulp-inject, because we
    // are (possibly) injecting in multiple tasks.
    return gulp
        .src(config.indexFile)
        .pipe($.debug())
        .pipe($.inject(gulp.src(config.builtcss, {
            read: false
        }), {
            name: 'styles'
        }))
        .pipe(gulp.dest(config.client + '/'));
});

gulp.task('serve-build', ['optimize'], function() {
    serve(false);
});

gulp.task('serve-dev', ['inject'], function() {
    serve(true);
});

gulp.task('images', ['clean-build-images'], function() {

    log('Copying and compressing images...');

    return gulp
        .src(config.images)
        .pipe($.imagemin({
            optimizationLevel: 4
        }))
        .pipe(gulp.dest(config.build + '/images'));
});

gulp.task('fonts', ['clean-build-fonts'], function() {

    log('Copying fonts...');

    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + '/fonts'));
});

gulp.task('optimize', ['inject', 'images', 'fonts'], function() {
    log('optimizing js, css and html...');

    var assets = $.useref.assets({
        searchPath: './'
    });

    var cssfilter = $.filter('**/*.css', {
        restore: true
    });

    var jsfilter = $.filter('**/*.js', {
        restore: true
    });

    return gulp.src(config.indexFile)
        .pipe($.plumber())
        // get all the assets
        .pipe(assets)
        // filter to just the css-assets
        .pipe(cssfilter)
        // run csso (css optimizer)
        .pipe($.csso())
        // restore to full set of assets
        .pipe(cssfilter.restore)
        // filter to just the js-assets
        .pipe(jsfilter)
        // run uglify (js optimizer)
        .pipe($.uglify())
        // restore to full set of assets
        .pipe(jsfilter.restore)
        // restore all the assets
        .pipe(assets.restore())
        // bundle
        .pipe($.useref())
        .pipe(gulp.dest(config.build));

});

gulp.task('default', ['help']);

///////////

function serve(isDev) {

    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]
    };

    return $.nodemon(nodeOptions)
        .on('restart', ['check-style'], function(ev) {
            log('nodemon restarted ' + ev);

            setTimeout(function() {
                browserSync.notify('realoading browsersync');
                browserSync.reload({
                    stream: false
                });
            }, config.browserReloadDelay);
        })
        .on('start', function() {
            log('nodemon started');
            startBrowserSync(isDev);
        })
        .on('crash', function() {
            log('nodemon crash');
        })
        .on('exit', function() {
            log('nodemon exit');
        });
}

function changeEvent(ev) {
    var regex = '/.*(?=/' + config.source;
    log('File ' + ev.path + ' ' + ev.type);
    log('File ' + ev.path.replace(regex, '') + ' ' + ev.type);
}

function startBrowserSync(isDev) {
    if (args.nosync || browserSync.active) {
        return;
    }

    log('starting browsersync on port ' + port);

    if (isDev) {
        gulp.watch(config.less, ['less2css'])
            .on('change', function(ev) {
                changeEvent(ev);
            });

        gulp.watch(config.jsxFiles, ['jsx'])
            .on('change', function(ev) {
                changeEvent(ev);
            });
    } else {
        gulp.watch([config.less, config.jsfiles], ['optimize', browserSync.reload])
            .on('change', function(ev) {
                changeEvent(ev);
            });
    }

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.client + '/**/*.*',
            '!' + config.less,
            '!' + config.jsxFiles,
            config.temp + '/*.js',
            config.temp + '/*.css'
        ] : [],
        ghostMode: {
            clicks: true,
            scroll: true,
            location: true,
            forms: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'testing-123',
        notify: true,
        reloadDelay: 0
    };

    browserSync(options);
}

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
