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

gulp.task('jsx-watcher', function() {
    return gulp.watch(config.jsxFiles, ['jsx']);
});

gulp.task('jsx', function() {

    log('Transpiling jsx to js...');

    gulp.src(config.clientjs)
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

gulp.task('serve-dev', ['inject'], function() {

    var isDev = true;

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
            startBrowserSync();
        })
        .on('crash', function() {
            log('nodemon crash');
        })
        .on('exit', function() {
            log('nodemon exit');
        });
});

gulp.task('default', ['inject']);

///////////

function changeEvent(ev) {
    var regex = '/.*(?=/' + config.source;
    log('File ' + ev.path + ' ' + ev.type);
    log('File ' + ev.path.replace(regex, '') + ' ' + ev.type);
}

function startBrowserSync() {
    if (args.nosync || browserSync.active) {
        return;
    }

    log('starting browsersync on port ' + port);

    gulp.watch(config.less, ['less2css'])
        .on('change', function(ev) {
            changeEvent(ev);
        });

    gulp.watch(config.jsxFiles, ['jsx'])
        .on('change', function(ev) {
            changeEvent(ev);
        });

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: [
            config.client + '/**/*.*',
            '!' + config.less,
            '!' + config.jsxFiles,
            config.temp + '/*.js',
            config.temp + '/*.css'
        ],
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
